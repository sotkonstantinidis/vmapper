function readDailyOutput(rawData, data, titles) {
    data = [];
    let date = [];
    let daily = {};
    let values = {};
    let max = {};
    let min = {};
    let avg = {}
    let med = {};
    let titleFlg = false;
    titles = [];
    let yearIdx = 0;
    let doyIdx = 1;
    let dasIdx = 2;
    let rowIdx = 3;
    let colIdx = 4;
    let year = 0;
    let doy = 0;
    let das = 0;
    let row = 0;
    let col = 0;
    for (let i = 0; i < rawData.length; i++) {
        let line = rawData[i].trim();
        if (line.startsWith("@")) {
            titleFlg = true;
            titles = readTitles(line);
            yearIdx = titles.indexOf("YEAR");
            doyIdx = titles.indexOf("DOY");
            dasIdx = titles.indexOf("DAS");
            rowIdx = titles.indexOf("ROW");
            colIdx = titles.indexOf("COL");
//            console.log(titles);
        } else if (line.startsWith("!") || line.length === 0) {
            continue;
        } else if (titleFlg) {
            let vals = line.split(/\s+/);
            let limit = Math.min(titles.length, vals.length);
            if (limit < vals.length) {
                console.log("line " + i + " have less data than title");
            }
            row = Number(vals[rowIdx]);
            col = Number(vals[colIdx]);
            if (das !== vals[dasIdx]) {
                year = vals[yearIdx];
                doy = vals[doyIdx];
                das = vals[dasIdx];
                date.push({YEAR: year, DOY: doy, DAS: das});
                daily = {DAS: das};
                data.push(daily);
                for (let j = 0; j < limit; j++) {
                    if (j !== yearIdx && j !== doyIdx && j !== dasIdx && j !== rowIdx && j !== colIdx) {
                        daily[titles[j]] = [[]];
                        values[titles[j]] = [];
                    }
                }
            }
            for (let j = 0; j < limit; j++) {
                if (j !== yearIdx && j !== doyIdx && j !== dasIdx && j !== rowIdx && j !== colIdx) {
                    while (daily[titles[j]].length < row) {
                        daily[titles[j]].push([]);
                    }
                    let val = Number(vals[j]);
                    daily[titles[j]][row - 1][col - 1] = val;
                    values[titles[j]].push(val);
                    if (max[titles[j]] === undefined || max[titles[j]] < val) {
                        max[titles[j]] = val;
                    }
                    if (min[titles[j]] === undefined || min[titles[j]] > val) {
                        min[titles[j]] = val;
                    }
                }
            }

        }
    }
    titles.splice(titles.indexOf("YEAR"), 1);
    titles.splice(titles.indexOf("DOY"), 1);
    titles.splice(titles.indexOf("DAS"), 1);
    titles.splice(titles.indexOf("ROW"), 1);
    titles.splice(titles.indexOf("COL"), 1);
    
    for (let key in values) {
        avg[key] = average(values[key]);
        med[key] = median(values[key]);
    }
    
    return {"titles":titles, "daily":data, "max":max, "min":min, "average":avg, "median":med};
}

function average(values) {
    let sum = 0;
    for (let i in values) {
        sum += values[i];
    }
    if (values.length >0 ) {
        return sum/values.length;
    } else {
        return 0;
    }
}

function median(values){
    values.sort(function(a,b){
    return a-b;
  });

  if(values.length ===0) return 0

  var half = Math.floor(values.length / 2);

  if (values.length % 2)
    return values[half];
  else
    return (values[half - 1] + values[half]) / 2.0;
}

function readTitles(line) {
    let titles = line.substring(1).split(/\s+/);
    let repeated = ["NFluxR", "NFluxL", "NFluxD", "NFluxU"];
    let appdex = ["A", "D"];
    for (let i = 0; i < repeated.length; i++) {
        let idx = titles.indexOf(repeated[i]);
        let j = 0;
        while (idx > -1) {
            if (j < appdex.length) {
                titles[idx] = titles[idx] + "_" + appdex[j];
            } else {
                titles[idx] = titles[idx] + "_" + j;
            }
            idx = titles.indexOf(repeated[i]);
            j++;
        }
    }
    return titles;
}

function getSoilStructure(data) {
    let soilProfile = {};
    if (data.length > 0) {
        let lastDay = data[data.length - 1];
        let keys = Object.keys(lastDay);
        if (keys.indexOf("DAS") > -1) {
            keys.splice(keys.indexOf("DAS"), 1);
        }
        if (keys.length > 0) {
            let randomData = lastDay[keys[0]];
            let totRows = randomData.length;
            let totCols = 0;
            let bedRows = 0;
            let bedCols = 0;
            if (totRows > 0) {
                totCols = randomData[totRows - 1].length;
                bedCols = randomData[0].length;
                while (bedRows < totRows && randomData[bedRows].length === bedCols) {
                    bedRows++;
                }
            }
            soilProfile["totRows"] = totRows;
            soilProfile["totCols"] = totCols;
            soilProfile["bedRows"] = bedRows;
            soilProfile["bedCols"] = bedCols;
        }
    }
    return soilProfile;
}
