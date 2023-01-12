export function csvToArray(str: string, delimiter: string = ",") {
  // slice from start of text to the first \n index
  // use split to create an array from string by delimiter
  const headers = str
    .slice(0, str.indexOf("\n"))
    .trim()
    .toLowerCase()
    .split(delimiter);

  // slice from \n index + 1 to the end of the text
  // use split to create an array of each csv value row
  const rows = str.slice(str.indexOf("\n") + 1).split("\n");

  // Map the rows
  // split values from each row into an array
  // use headers.reduce to create an object
  // object properties derived from headers:values
  // the object passed as an element of the array
  const arr = rows.map(function (row) {
    const values = row.split(delimiter);
    const el = headers.reduce(function (object, header, index) {
      object[header] = values[index]?.replace("\r", "");
      return object;
    }, {});
    return el;
  });

  // return the array
  return arr;
}

export function getCsvHeaders(str: string, delimiter: string = ",") {
  // slice from start of text to the first \n index
  // use split to create an array from string by delimiter
  const headers = str
    .slice(0, str.indexOf("\n"))
    .trim()
    .toLowerCase()
    .split(delimiter);

  return headers;
}

export function downloadCSVFile(csv: Blob, filename: string) {
  let csv_file, download_link;

  csv_file = new Blob([csv], { type: "text/csv" });

  download_link = document.createElement("a");

  download_link.download = filename;

  download_link.href = window.URL.createObjectURL(csv_file);

  download_link.style.display = "none";

  document.body.appendChild(download_link);

  download_link.click();
}
