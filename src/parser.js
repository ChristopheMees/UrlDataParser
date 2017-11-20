const htmlparser = require("htmlparser2");



let startedRecording = false;
let columnCount = -1;
let collector;

let result = "";

const parser = new htmlparser.Parser({
  onopentag: function(name, attribs){
    if(name === "table") {
      startedRecording = true;
    }
    if(startedRecording && name === "td" && columnCount < 0) {
      columnCount = 0;
      collector = '<node name="';
    }
  },
  ontext: function(text){
    if((columnCount === 0 || columnCount === 2) && text.trim() && !text.startsWith('[')) {
      collector += text;
    }
  },
  onclosetag: function(name){
    if(name === "table") {
      startedRecording = false;
    } else if(startedRecording && name === "td") {
      if(columnCount === 0) {
        collector += '" description="';
      } else if(columnCount === 2) {
        collector += '"/>';
      }
      columnCount++;
      if(columnCount > 2) {
        result += collector + '\r\n'
        collector = "";
        columnCount = -1;
      }
    }
  }
}, {decodeEntities: true});

export default function parse(html) {
  result = "";
  parser.write(html);
  return result;
}