# \see http://www.cprogramming.com/tutorial/makefiles_continued.html
# \author Sébastien Boisvert
# Copyright (C) 2012, 2013 Sébastien Boisvert

CXX=g++
#CXX=clang++
CXXFLAGS= -O3 -Wall -g -pipe -std=c++98 -I.
#CXXFLAGS= -O3 -Wall -g -march=native -pipe -std=c++98 -I.
#CXXFLAGS= -g -O0 -Wall -std=c++98 -I. -D CONFIG_ASSERT
#CXXFLAGS= -g -O3 -Wall -std=c++98 -I. -D CONFIG_ASSERT
RM=rm
Q=@

TARGETS=RayCloudBrowser.cgi RayCloudBrowser-client

STORAGE= storage/GraphDatabase.o storage/VertexObject.o storage/Mapper.o \
storage/PathDatabase.o storage/AnnotationEngine.o \
storage/LocationAnnotation.o storage/Annotation.o storage/Configuration.o \
JSONParser.o JSONNode.o

ACTIONS= actions/WebAction.o actions/StoreRequest.o actions/RegionVisitor.o \
actions/EarlyExplorer.o actions/MapList.o actions/RegionClerk.o actions/MapSpecialist.o \
actions/AnnotationFetcher.o

SERVICE= webServer_main.o WebService.o

CLIENT= client_main.o Client.o

COMMANDS= commands/ObjectFetcher.o commands/GraphManager.o commands/PathHelper.o \
commands/Explorer.o commands/PathProbe.o \
commands/Parser.o commands/GraphExporter.o commands/AnnotationManager.o \
commands/AnnotationReporter.o commands/MapDescriber.o commands/ObjectAnnotationList.o \
commands/ConfigurationReader.o commands/MapPusher.o commands/SectionPusher.o

%.o: %.cpp
	$(Q)echo "CXX $@"
	$(Q)$(CXX) $(CXXFLAGS) -c $? -o $@

all: $(TARGETS)

RayCloudBrowser.cgi: $(SERVICE) $(STORAGE) $(ACTIONS)
	$(Q)echo "CXX $@"
	$(Q)$(CXX) $(CXXFLAGS) $^ -o $@
	$(Q)chmod g-w $@
	$(Q)chmod o-w $@

RayCloudBrowser-client: $(CLIENT) $(STORAGE) $(COMMANDS)
	$(Q)echo "CXX $@"
	$(Q)$(CXX) $(CXXFLAGS) $^ -o $@

clean:
	$(Q)echo "RM"
	$(Q)$(RM) -f $(TARGETS) $(STORAGE) $(SERVICE) $(CLIENT) $(COMMANDS) $(ACTIONS)

check: devel test-first test-store test-not-found

test-store:
	QUERY_STRING="tag=RAY_MESSAGE_TAG_GET_KMER_FROM_STORE&content=CATGAAAACGGGTTTTCCCATATTGACGCTA" ./RayCloudBrowser.cgi

test-first:
	QUERY_STRING="tag=RAY_MESSAGE_TAG_GET_FIRST_KMER_FROM_STORE" ./RayCloudBrowser.cgi

test-not-found:
	QUERY_STRING="tag=RAY_MESSAGE_TAG_GET_KMER_FROM_STORE&content=fdfddfjdsfdjsclkk" ./RayCloudBrowser.cgi

path-index:
	./RayCloudBrowser-client create-section ~/Ray-Cloud-Browser-data/Contigs.fasta ~/Ray-Cloud-Browser-data/Contigs.fasta.dat

graph-index:
	./RayCloudBrowser-client create-map ~/Ray-Cloud-Browser-data/kmers.txt.sorted ~/Ray-Cloud-Browser-data/kmers.txt.dat

debug-path:
	./RayCloudBrowser-client describe-section debug Contigs.fasta.dat|less

test-json:
	./RayCloudBrowser-client describe-json-file test.json
