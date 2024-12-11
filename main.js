// --  functions for creating graphs from backend json-data  --
function getLabelArrFromJson (json, key) {
    //this function takes all the keyvalues with the specified key and returns them as an array
    const labelArr = []
    for (let obj of json) {
        labelArr.push(obj[key]) //we are using "[]" and not obj.key because then it reads the variable and not literally "key"
    }
    return labelArr
}

function getDatasetObjFromJson (keyNumber, json, label) { //!!important!! use 0 as first keyNumber
    // this function first adds the datasets-key if it does not exist,
    // then it pushes a dataset-object with the keyvalues from the keyNumber from the argument
    // it also adds a label as a string that can be whatever you want.
    // the reason we use the keyNumber and not just the first key, witch would be the same as the first collum in our data-table is so that we can get multible datasets without making more fetch-requests.

    const datasetObj = { //this is the object we will push to the datasets-array
        label: label,
        data: []
    }

    const objKeyArr = Object.keys(json[0]) //we assume the keys are the same in all objects and therefore only check the first one
    const key = objKeyArr[keyNumber]
    for (let obj of json) {
        datasetObj.data.push(obj[key])
    }

    return datasetObj
}



//  --  graph container 2  --
function addContainer2GraphStylingKeys (chartObj) {
    //since i want both of my graphs to look the same, and not make the fetchcode to confusing, i have made the styling options into a function that apllies it to the chartObj
    const datasetObj = chartObj.data.datasets[0]
    datasetObj.pointRadius = 0
    datasetObj.borderWidth = 10
    datasetObj.fill = true

    chartObj.options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                align: 'start',
                labels: {
                    boxWidth: 0,
                    font: {
                        size: 30
                    }
                }
            }
        },
        scales: {
            x: {
                ticks: {maxTicksLimit: 5},
                grid: {drawOnChartArea:false}
            },
            y: {
                beginAtZero: false,

                grid: {
                    drawOnChartArea:false
                }
            }
        }
    }

    //gradiant! youtube tutorial for doing it to other graphs: https://www.youtube.com/watch?v=6hgc9sPDiho
}


//chart 1 - total posts
fetch('http://localhost:3000/getData/byQuarter/select=count(*);having=yearquarter>="2022Q1"')
    .then(response => response.json())
    .then(jsondata => {
        const chartObj ={
            type: 'line',
            data: {
                labels: getLabelArrFromJson(jsondata, 'yearquarter'),
                datasets: [getDatasetObjFromJson(0, jsondata, 'Total Posts')]
            }
        }
        addContainer2GraphStylingKeys(chartObj)
        const chartDom = document.querySelector(".second_container > div > div > div:nth-child(1) > canvas").getContext('2d')
        new Chart(chartDom, chartObj)
    })

//chart 2 - avg interactions
fetch('http://localhost:3000/getData/byQuarter/select=avg(metrics.total_interactions);having=yearquarter>="2022Q1"')
    .then(response => response.json())
    .then(jsondata => {
        const chartObj ={
            type: 'line',
            data: {
                labels: getLabelArrFromJson(jsondata, 'yearquarter'),
                datasets: [getDatasetObjFromJson(0, jsondata, 'Average Interactions')]
            }
        }
        addContainer2GraphStylingKeys(chartObj)
        const chartDom = document.querySelector(".second_container > div > div > div:nth-child(2) > canvas").getContext('2d')
        new Chart(chartDom, chartObj)
    })


//  --  graph container 4  --
function addContainer4GraphStylingKeys (chartObj) {
    const datasetObj = chartObj.data.datasets[0]
    datasetObj.borderColor = ['#ffd500']
    datasetObj.backgroundColor = ['#ffd500']


    chartObj.options = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false
    }

    document.querySelector(".fourth_container > div:nth-child(2) > div > canvas").style.height = '80vh'
}


fetch('http://localhost:3000/getData/notAgainst/byAvgTotalInteractions/select=metrics.post_type;having=avg(metrics.total_interactions)>100')
    .then(response => response.json())
    .then(jsondata => {
        const chartObj ={
            type: 'bar',
            data: {
                labels: getLabelArrFromJson(jsondata, 'post_type'),
                datasets: [getDatasetObjFromJson(0, jsondata, 'Average Interactions')]
            }
        }

        addContainer4GraphStylingKeys(chartObj)

        const chartDom = document.querySelector(".fourth_container > div:nth-child(2) > div > canvas").getContext('2d')
        new Chart(chartDom, chartObj)
    })





fetch('http://localhost:3000/getData/category/reactions')
    .then(response => response.json())
    .then(data => {
        console.log(data);

        const labels = data.map(item => item.category);
        const values = data.map(item => item.avg_reactions);

        console.log('Labels:', labels, 'Values:', values);

        const ctx = document.querySelector(".fifth_container > div:nth-child(2) > div > canvas").getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Average Interactions per Category',
                    data: values,
                    backgroundColor: "#005bbb",
                    tension: 0.3
                }]
            },
            options: {
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            font: {
                                size: 30
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            font: {
                                size: 30
                            },
                        },
                    },
                    x: {
                        ticks: {
                            font: {
                                size: 24
                            },
                            color: '',

                        }
                    },
                }
            }
        });
    })

    document.querySelector(".fifth_container > div:nth-child(2) > div > canvas").style.height = "80vh"

    .catch(error => {
        console.error('Error fetching data:', error);
    });
