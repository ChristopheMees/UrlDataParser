const htmlparser = require("htmlparser2");

let startedRecording = false;
let rowStarted = false;
let columnCount = -1;
let firstRow = true;

let inNameSegment = false;

let name = "";
let description = "";

let data = [];

export function nodeString(name, description) {
  return '<node name="' + name + '" description="' + description + '" valueNode="true"/>';
}

export function createNodesForRange(name, description) {
  const parts = name.split(" ");
  const start = parseInt(parts[1]);
  let endStr = parts[3];
  if(endStr.includes('UN')) {
    endStr = parseInt(parts[4]);
  }
  const end = parseInt(endStr);

  const names = [];

  for(let i = start;i < end + 1;i++) {
    let nameString = i.toString();
    while(nameString.length < 4) {
      nameString = '0' + nameString;
    }

    nameString = "UN" + nameString;

    names.push(nameString);
  }

  return names.map((n) => nodeString(n, description))
    .reduce((agg, node) => agg + "\r\n" + node);
}

export function createNode(name, description) {
  if(name.includes("to")) {
    return createNodesForRange(name, description);
  } else {
    return nodeString(name.replace(" ", ""), description)
  }
}

export function openTag(tag) {
  if(tag === "table") {
    startedRecording = true;
  }
  if(tag === "tr" && !firstRow) {
    rowStarted = true;
  } else if(tag === "tr" && firstRow) {
    firstRow = false;
  }
  if(startedRecording && rowStarted && tag === "td" && columnCount < 0) {
    inNameSegment = true;
    columnCount = 0;
  }
}

function handleText(text) {
  if(rowStarted && columnCount !== 1 && text.trim() && !text.startsWith('[')) {
    if(inNameSegment) {
      inNameSegment = false;
      name = text;
    } else {
      description += text;
    }
  }
}

function closeTag(tag) {
  if(tag === "table") {
    startedRecording = false;
    firstRow = true;
  } else if(startedRecording && tag === "td") {
    if(columnCount > 2) {
      description += ' ';
    }
    columnCount++;

  } else if(rowStarted && tag === "tr") {
    data.push([name, description]);

    rowStarted = false;
    name = "";
    description = "";
    columnCount = -1;
  }
}

const parser = new htmlparser.Parser({
  onopentag: openTag,
  ontext: handleText,
  onclosetag: closeTag});

export default function parse(html) {
  data = [];
  parser.write(html);
  return data.filter(([name]) => name.includes('UN'))
             .map(([name, description]) => createNode(name, description))
             .reduce((agg, node) => agg + "\r\n" + node);
}