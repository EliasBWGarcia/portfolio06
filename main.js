// --  functions for creating graphs from backend json-data  --
function getLabelArrFromJson (json, key) {
    //this function takes all the keyvalues with the specified key and returns them as an array
    const labelArr = []
    for (let obj of json) {
        //we bruteforce a replace function for each charector in string where we replace all the "_" with spaces, it is in a for-loop because otherwise it will only replace the first one
        let labelStr = obj[key]
        for (let i = 0; i < obj[key].length; i++) {
            labelStr = labelStr.replace('_',' ')
        }
        labelArr.push(labelStr) //we are using "[]" and n ot obj.key because then it reads the variable and not literally "key"
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
    datasetObj.backgroundColor = ['#b68e00']
    datasetObj.borderColor = '#ffd500'

    chartObj.options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                align: 'start',
                labels: {
                    color: 'white',
                    boxWidth: 0,
                    font: {
                        size: 30,

                    }
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    maxTicksLimit: 2,
                    color: 'lightgrey'
                },
                grid: {drawOnChartArea:false}
            },
            y: {
                beginAtZero: false,
                grid: {
                    drawOnChartArea:false
                },
                ticks: {
                    color: 'lightgrey',

                }
            }
        }
    }
    //yellow color #ffd500
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
document.querySelector(".fourth_container > div > div:nth-child(2) > div > canvas").style.height = '80vh'
function addContainer4GraphStylingKeys (chartObj) {
    const datasetObj = chartObj.data.datasets[0]
    datasetObj.borderColor = ['#ffd500']
    datasetObj.backgroundColor = ['#ffd500']

    chartObj.options = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                align: 'start',
                labels: {
                    boxWidth: 0,
                    color: 'white'
                }
            }
        },
        scales: {
            x: {
                position: 'top',
                ticks: {
                    color: 'darkgrey',
                    maxTicksLimit: 4
                },
                grid: {drawOnChartArea:false}
            },
            y: {
                ticks: {
                    color: 'black',
                    mirror: true,
                    z: 1,
                    font: {
                        size: 30
                    }
                }
            }
        }
    }
}


fetch('http://localhost:3000/getData/notAgainst/byAvgTotalInteractions/select=metrics.post_type;having=avg(metrics.total_interactions)>100;limit=5')
    .then(response => response.json())
    .then(jsondata => {
        const chartObj ={
            type: 'bar',
            data: {
                labels: getLabelArrFromJson(jsondata, 'post_type'),
                datasets: [getDatasetObjFromJson(0, jsondata, '*Average Interactions Per Post Type')]
            }
        }

        addContainer4GraphStylingKeys(chartObj)

        const chartDom = document.querySelector(".fourth_container > div > div:nth-child(2) > div > canvas").getContext('2d')
        new Chart(chartDom, chartObj)
    })




//  --  graph container 5  --
fetch('http://localhost:3000/getData/category/reactions')
    .then(response => response.json())
    .then(data => {


        const labels = data.map(item => item.category);
        const values = data.map(item => item.avg_reactions);



        const ctx = document.getElementById('wordChartContainer5').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Average reactions',
                    data: values,
                    backgroundColor:"#005bbb",
                    tension: 0.6
                }]
            },
        });
    })

    document.querySelector(".fifth_container > div:nth-child(2) > div > canvas").style.height = "80vh"

//  --  hashtag container  --

function addStylingToHashtagChart (chartObj) {
    const datasetObj = chartObj.data.datasets[0]
    datasetObj.borderColor = ['#005bbb']
    datasetObj.backgroundColor = ['#005bbb']
    datasetObj.label = '*avgerage interations grouped by incultion of "#"'
    chartObj.options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                position: 'right',
                maxTicksLimit: 2,
                grid: {drawOnChartArea: false}
            },
            x: {
                ticks: {
                    mirror: false,
                    padding: 0,
                    align: 'center',
                    color: 'black',
                    font: {
                        size: 20,
                        weight: 'bold',
                    }
                },
                grid: {drawOnChartArea: false}
            }
        },
        plugins: {
            legend: {
                align: 'end',
                labels: {
                    color: 'lightgray',
                    boxWidth: 0,
                    font: {

                    }
                }
            }
        },
        elements: {
            bar: {
                backgroundColor: 'rgba(255, 213, 0, 0.8)', // Make bars slightly transparent
                borderWidth: 0,
            }
        }
    }
}

async function makeHashtagChart () {
    const chartData = []
    await fetch('http://localhost:3000/getData/notAgainst/useingHashtag=true')
        .then(response => response.json())
        .then(data => {
            chartData.push(data[0])
        })
    await fetch('http://localhost:3000/getData/notAgainst/useingHashtag=false')
        .then(response => response.json())
        .then(data => {
            chartData.push(data[0])
        })
    const chartObj ={
        type: 'bar',
        data: {
            labels: ['posts including hashtags','posts without hashtags'],
            datasets: [{
                data: [chartData[0].avgInteractions, chartData[1].avgInteractions]
            }]
        }
    }
    addStylingToHashtagChart(chartObj)
    const DOMCanvas = document.querySelector('.hashtag_container > div > div:nth-child(2) > div > canvas')
    new Chart(DOMCanvas, chartObj)
}

makeHashtagChart()


//  --  graph container 6  --
fetch('http://localhost:3000/getData/textLength/reactions')
    .then(response => response.json())
    .then(data => {
        const canvas = document.querySelector(".top_word_container > div:nth-child(2) > div > canvas");
        canvas.style.height = "80vh";
        canvas.style.width = "100vw";


        const labels = data.map(item => item.text_length_range);
        const values = data.map(item => item.avg_reactions_range);




        const ctx = document.getElementById('wordChartContainer6').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Average Reactions',
                    data: values,
                    backgroundColor: values.map((value, index) =>
                        index === 3 ? "rgba(255, 213, 0, 1)" : "rgba(255, 213, 0, 0.7)" // Fourth bar highlighted
                    ),
                    tension: 0.6
                }]
            },
            options: {
                plugins: {
                    legend: {
                        labels: {
                            color: 'white',
                            boxWidth: 0
                        }
                    }
                },
                indexAxis: 'x', // Horizontal bar chart
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: 'lightgrey',
                            font: {
                                size: 10
                            }
                        },
                        grid: {
                            drawOnChartArea: false // Disable gridlines
                        }
                    },
                    x: {
                        ticks: { //
                            color: 'white', // Font color for x-axis
                            font: {
                                size: 10
                            }
                        }
                    }
                }
            }
        });
    })


// -------------------------------- Chart ------------------------ //

fetch('http://localhost:3000/word-count')  // Adjust this URL if needed
    .then(response => response.json())
    .then(data => {


        // Assuming data is in the form of an array of objects like:
        // [{ word: 'example', count: 10 }, {...}, ...]

        const labels = data.map(item => item[0]); // Accessing the word (first element of the array)
        const values = data.map(item => item[1]); // Accessing the count (second element of the array)

document.querySelector(".top_word_container > div:nth-child(2) > div > canvas").style.height = "80vh"

        document.querySelector(".top_word_container > div:nth-child(2) > div > canvas").style.height = "80vh"

        document.addEventListener("DOMContentLoaded", () => {
            document.querySelector(".top_word_container > div:nth-child(2) > div > canvas").style.width = "100vw";
        });

        // Create the new chart for top 15 words
        const ctx = document.getElementById('wordChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',  // You can change the type to 'horizontalBar' if needed
            data: {
                labels: labels,
                datasets: [{
                    label: 'Top 10 Words',
                    data: values,
                    backgroundColor: values.map((value, index) =>
                        index === 0 ? "rgba(0, 91, 187, 1)" :index === 7 ? "rgba(0, 91, 187, 1)": "rgba(0, 91, 187, 0.7)"), // Make the fourth pillar 100% opacity
                    tension: 0.6
                }]
            },
            options: {
                scales: {
                    y: {
                        grid:{
                            drawOnChartArea: false,
                        },
                        beginAtZero: true,
                        ticks: {
                            color: 'white', // Change font color to light grey
                            font: {
                                size: 14
                            }
                        }
                    },
                    x: {
                        grid: {
                            offset: true,
                        },
                        ticks: {
                            color: 'white', // Change font color to light grey
                            font: {
                                size: 14
                            }
                        }
                    }
                },
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            font: {
                                size: 16
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(tooltipItem) {
                                return tooltipItem.label + ': ' + tooltipItem.raw;  // Show count on tooltip
                            }
                        }
                    }
                }
            }
        });
    })


