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

/**
 * A selection widget.
 *
 * \author Sébastien Boisvert
 */
function IntegerSelectionWidget(x,y,width,height,title,minimum,maximum){
	this.minBlink = 160;
	this.maxBlink = 255;
	this.colorIndex = this.minBlink;
	this.increment = true;
	this.blink = false;
	this.theColor = "#FFF8F9";

	this.x=x;
	this.y=y;
	this.title=title;
	this.minimum=minimum;
	this.maximum=maximum;
	this.gotFinalChoice=false;
	this.finalChoice=minimum;
	this.fontSize=12;

	var digits=0;

	var base=10;

	var exponent=0;


	while(1){
		var value=1;
		var i=0;
		while(i<exponent){
			value*=base;
			i+=1;
		}

		var digit=Math.floor(maximum/value);

		if(digit>0 || value<this.maximum){
			digits++;
			exponent++;
		}else{
			break;
		}
	}

	this.digits=digits;

	this.rawMinimums=this.getDigits(this.digits,this.minimum);
	this.rawMaximums=this.getDigits(this.digits,this.maximum);
	this.minimums=this.getDigits(this.digits,this.minimum);
	this.maximums=this.getDigits(this.digits,this.maximum);

	this.symbols=this.getDigits(this.digits,this.minimum);

	this.width=width;
	this.height=height;

	var buttonDimension=25;

	var stepping=7;

	this.previousButton=new Button(this.x+this.width/2-buttonDimension/2-2,
		this.y+this.height-buttonDimension/2-stepping,
		buttonDimension,buttonDimension,"<<",false);

	this.nextButton=new Button(this.x+this.width/2+buttonDimension/2+2,
		this.y+this.height-buttonDimension/2-stepping,
		buttonDimension,buttonDimension,">>",false);

	this.okButton=new Button(this.x+this.width-buttonDimension/2-stepping,
		this.y+this.height-buttonDimension/2-stepping,
		buttonDimension,buttonDimension,"OK",false);

	this.minButton=new Button(this.x+this.width/2+buttonDimension/2,
		this.y+this.height-buttonDimension/2-stepping,
		buttonDimension+stepping,buttonDimension,"first",false);

	this.maxButton=new Button(this.x+this.width/2+buttonDimension/2+8*stepping,
		this.y+this.height-buttonDimension/2-stepping,
		buttonDimension+stepping,buttonDimension,"last",false);

	this.finished=false;

	this.createButtons();
}

/**
 * 1234,0  other=1 next=10 digit=(1234%10)/1=4
 * 1234,1  other=10 next=100 digit=(1234%100)/10=34/10=3
 */
IntegerSelectionWidget.prototype.getDigit=function(value,position){
	var other=1;
	var i=0;
	var base=10;
	while(i++<position)
		other*=base;

	var next=other*base;

	var digit=Math.floor((value%next)/other);

	return digit;
}

IntegerSelectionWidget.prototype.getDigits=function(digits,inputValue){

	var value=[];
	var i=0;
	while(i<digits){
		var theDigit=this.getDigit(inputValue,i);
		value.push(theDigit);
		i++;
	}

	return value;
}

IntegerSelectionWidget.prototype.createButtons=function(){

	this.buttons=new Array();

	this.buttons.push(this.okButton);

	this.buttons.push(this.minButton);

	this.buttons.push(this.maxButton);

	this.upButtons=[];
	this.downButtons=[];

	var i=0;

	var buttonDimension=15;
	while(i<this.digits){
		var downButton=new Button(this.x+this.width/20+250-i*20,
			this.y+150+20,
			buttonDimension,buttonDimension,"↓",false);

		var upButton=new Button(this.x+this.width/20+250-i*20,
			this.y+150-30,
			buttonDimension,buttonDimension,"↑",false);

		this.downButtons.push(downButton);
		this.upButtons.push(upButton);

		i++;
	}
}

IntegerSelectionWidget.prototype.updateBoundaries=function(){
	var i=0;
	var minimums = new Array();
	var maximums = new Array();
	for(var i = 0; i < this.digits; i++) {
		minimums[i] = this.minimums[i];
	}
	for(var i = 0; i < this.digits; i++) {
		maximums[i] = this.maximums[i];
	}

// reset boundaries
	while(i<this.digits){
		this.minimums[i]=this.rawMinimums[i];
		this.maximums[i]=this.rawMaximums[i];
		i++;
	}

	i=this.digits-1;
	var base=10;
// recalculate boundaries
	while(i>=0){
		if(this.symbols[i]<this.rawMaximums[i]){
			var j=i-1;
			while(j>=0){
				this.maximums[j]=base-1;
				j--;
			}
		}
		i--;
	}

// check if we can have 0 for the first

	i=this.digits-1;
	var canHaveZero=false;
	while(i>=1){
		if(this.symbols[i]!=0){
			canHaveZero=true;
			break;
		}
		i--;
	}

	for(var i = 0; i < this.digits; i++) {
		this.minimums[i] = 0;
	}
	for(var i = 0; i < this.digits; i++) {
		this.maximums[i] = 9;
	}
	if(canHaveZero){
		this.minimums[0]=0;
	}

// validate the new boundaries
	i=0;
	while(i<this.digits){
		if(this.symbols[i]>this.maximums[i])
			this.symbols[i]=this.maximums[i];

		if(this.symbols[i]<this.minimums[i])
			this.symbols[i]=this.minimums[i];
		i++;
	}
	for(var i = 0; i < this.digits; i++) {
		this.minimums[i] = minimums[i];
	}
	for(var i = 0; i < this.digits; i++) {
		this.maximums[i] = maximums[i];
	}
}

IntegerSelectionWidget.prototype.enableBlink = function() {
	this.blink = true;
	this.colorIndex = this.minBlink;
}

IntegerSelectionWidget.prototype.disableBlink = function() {
	this.blink = false;
	this.theColor = "#FFF8F9";
}

IntegerSelectionWidget.prototype.getBlink = function() {
	return this.blink;
}


IntegerSelectionWidget.prototype.blinkBox = function(context){
	if(this.increment) {
		this.colorIndex += 3;
		if(this.colorIndex >= this.maxBlink) {
			this.increment = false;
		}
	} else {
		this.colorIndex -= 3;
		if(this.colorIndex <= this.minBlink) {
			this.increment = true;
		}
	}
	this.theColor = "rgb(" + (this.colorIndex - 100) + ", " + (this.colorIndex - 50) + ", " + this.colorIndex + ")";
}

IntegerSelectionWidget.prototype.draw=function(context){

	this.updateBoundaries();

	context.beginPath();
	context.rect(this.x, this.y, this.width, this.height );
	context.fillStyle = this.theColor;

	context.fill();
	context.lineWidth = 1;
	context.strokeStyle = 'black';
	context.stroke();

	context.fillStyle    = '#000000';
	context.font         = 'bold '+this.fontSize+'px Arial';
	context.fillText(this.title, this.x+this.width/20,this.y+20);

	if(!this.finished)
		context.fillText("Range: "+this.minimum+" to "+this.maximum, this.x+this.width/20+30,this.y+80);

	var i=0;
	while(i<this.digits){

		if(!this.finished)
			context.fillText(this.symbols[i], this.x+this.width/20+250-i*20,this.y+150);
		i++;
	}

	context.fillStyle    = '#000000';
	context.font         = ''+this.fontSize+'px Arial';

	if(this.finished){

		context.fillText(this.finalChoice, this.x+this.width/9,this.y+40);

		return;
	}

	var i=0;
	while(i<this.buttons.length){
		this.buttons[i++].draw(context,null);
	}

	i=0;
	while(i<this.downButtons.length){
		var minimum = this.minimums[i];
		var first = true;
		for(var j = this.downButtons.length; j > i; j--) {
			if(this.symbols[j] != this.minimums[j]) {
				first = false;
			}
		}
		if(!first) {
			minimum = 0;
		}
		if(this.symbols[i]!=minimum)
			this.downButtons[i].draw(context,null);

		i++;
	}

	i=0;
	while(i<this.upButtons.length){
		var maximum = this.maximums[i];
		var last = true;
		for(var j = this.upButtons.length; j > i; j--) {
			if(this.symbols[j] != this.maximums[j]) {
				last = false;
			}
		}
		if(!last) {
			maximum = 9;
		}
		if(this.symbols[i]!=maximum) {
			this.upButtons[i].draw(context,null);
		}

		i++;
	}
}

IntegerSelectionWidget.prototype.move=function(x,y){
	this.x+=x;
	this.y+=y;

	var i=0;
	while(i<this.buttons.length){
		this.buttons[i++].move(x,y);
	}

	i=0;
	while(i<this.downButtons.length){
		this.downButtons[i++].move(x,y);
	}

	i=0;
	while(i<this.upButtons.length){
		this.upButtons[i++].move(x,y);
	}
}

IntegerSelectionWidget.prototype.handleMouseDoubleClick = function(x, y) {
	return false;
}

IntegerSelectionWidget.prototype.handleMouseDown=function(x,y){

	var result=false;
	var i=0;
	while(i<this.buttons.length){
		if(this.buttons[i].handleMouseDown(x,y)){
			result=true;
			break;
		}
		i++;
	}

	if(this.minButton.getState()){
		var i=0;
		while(i<this.digits){
			this.symbols[i]=this.minimums[i];
			i++;
		this.minButton.resetState();
		}
	}

	if(this.maxButton.getState()){
		var i=0;
		while(i<this.digits){
			this.symbols[i]=this.maximums[i];
			i++;
		this.maxButton.resetState();
		}
	}

	if(this.okButton.getState()){

		var base=10;
		var i=0;

		var value=0;

		while(i<this.digits){
			var toAdd=1;
			var j=0;
			while(j<i){
				toAdd*=base;
				j++;
			}

			value+=toAdd*this.symbols[i];
			i++;
		}

		this.finalChoice=value;
		this.gotFinalChoice=true;
	}

	if(result)
		return result;

	i=0;
	var click = false;
	while(i<this.digits){
		if(this.upButtons[i].handleMouseDown(x,y)){
			this.symbols[i]++;

			this.upButtons[i].resetState();
			click = true;
		}
		i++;
	}
	if(this.getValue() > this.maximum) {

		for(var i = 0; i < this.digits; i++) {
			this.symbols[i] = this.maximums[i];
		}
	}


	i=0;
	while(i<this.digits){
		if(this.downButtons[i].handleMouseDown(x,y)){
			this.symbols[i]--;

			this.downButtons[i].resetState();
			click = true;
		}
		i++;
	}
	if(this.getValue() < this.minimum) {

		for(var i = 0; i < this.digits; i++) {
			this.symbols[i] = this.minimums[i];
		}
	}

	return click;
}

IntegerSelectionWidget.prototype.hasChoice=function(){
	return this.gotFinalChoice;
}

IntegerSelectionWidget.prototype.getChoice=function(){

	this.updateBoundaries();

	return this.finalChoice;
}

IntegerSelectionWidget.prototype.resetState=function(){
	this.gotFinalChoice=false;
	this.finished=true;
}


IntegerSelectionWidget.prototype.getValue = function() {
	var base = 10;
	var i = 0;
	var value = 0;
	while(i < this.digits) {
		var toAdd = 1;
		var j = 0;
		while(j < i) {
			toAdd *= base;
			j++;
		}
		value += toAdd * this.symbols[i];
		i++;
	}
	return value;
}
