
var smallword=["bin","binti","to","a","for","in"];


function is_in_small(text){
  var i=0;
  while(i<smallword.length){
    if(smallword[i]==text.toLowerCase()){
      return true;
    }
    i=i+1;
  }
  return false;
}

String.prototype.toTitleCase = function () {
    return this.replace(/\w\S*/g, function(txt){
      if(is_in_small(txt)){
	return txt.toLowerCase();
      }
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}
    );
};
