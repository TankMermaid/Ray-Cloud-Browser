/*
 *  Ray Cloud Browser: interactively skim processed genomics data with energy
 *  Copyright (C) 2012, 2013 Sébastien Boisvert
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, version 3 of the License.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

#include "AnnotationEngine.h"
#include "Mapper.h"

#include <fstream>
using namespace std;

#include <string.h>

#define OFFSET_NULL 0
#define OFFSET_MAGIC_NUMBER 0
#define OFFSET_FORMAT_VERSION sizeof(uint32_t)
#define OFFSET_COUNT sizeof(uint32_t)+sizeof(uint32_t)
#define OFFSET_HEAP sizeof(uint32_t)+sizeof(uint32_t)+sizeof(uint64_t);

void AnnotationEngine::getAnnotations(const char*key,vector<Annotation>*annotations)const{
}

void AnnotationEngine::openAnnotationFileForMap(GraphDatabase*graph){
	m_map=graph;

	m_magicNumber=0x87332cee;
	m_formatVersion=0;

	m_fileName=m_map->getFileName();
	m_fileName+="-Annotations";

	checkFileAvailability();
}

void AnnotationEngine::closeFile(){
}

void AnnotationEngine::getLocations(const char*key,vector<LocationAnnotation>*annotations)const{
}

void AnnotationEngine::addLocation(const char*key,LocationAnnotation*annotation){

#if 0
	cout<<"<addLocation object=\""<<key<<"\"";
	annotation->print();
#endif

	uint64_t index=0;
	bool found=m_map->getObjectIndex(key,&index);

	if(!found)
		return;
#if 0
	if(found){
		cout<<" index=\""<<index<<"\"";
	}

	cout<<" />"<<endl;
#endif
}

void AnnotationEngine::checkFileAvailability(){

	ifstream f(m_fileName.c_str());

	bool fileIsThere=false;
	if(f)
		fileIsThere=true;
	f.close();

	if(fileIsThere)
		return;

	FILE*output=fopen(m_fileName.c_str(),"w");
	fwrite(&m_magicNumber,sizeof(uint32_t),1,output);
	fwrite(&m_formatVersion,sizeof(uint32_t),1,output);

	uint64_t entries=m_map->getEntries();
	uint64_t heap=0;

	fwrite(&entries,sizeof(uint64_t),1,output);
	fwrite(&heap,sizeof(uint64_t),1,output);

	uint64_t offset=OFFSET_NULL;

	uint64_t index=0;

	while(index<entries){

		fwrite(&offset,sizeof(uint64_t),1,output);

		index++;
	}

	fclose(output);

	m_mapper.enableWriteOperations();
	m_mapper.enableReadOperations();

	m_content=(uint8_t*)m_mapper.mapFile(m_fileName.c_str());

	if(m_content==NULL){
		cout<<"Error: failed to map file "<<m_fileName<<endl;
		return;
	}

	heap=m_mapper.getFileSize();

	setHeap(heap);

	m_mapper.unmapFile();
}

void AnnotationEngine::setHeap(uint64_t heap){

	uint64_t offset=OFFSET_HEAP;

	memcpy(m_content+offset,&heap,sizeof(uint64_t));
}