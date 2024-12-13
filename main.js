

fetch('http://localhost:3000/test')
    .then(response => response.json())
    .then(data => {
        console.log('Fetched Data:', data);

        const labels = data.map(item => item.yearquarter);
        const values = data.map(item => item.total_interactions);

        console.log('Labels:', labels, 'Values:', values);

        const ctx = document.getElementById('myChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Total Interactions',
                    data: values,
                    backgroundColor: "rgba(229,15,21)",
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 1
                }]
            },
            options: {
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
                            }
                        }
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
    .catch(error => {
        console.error('Error fetching data:', error);
        alert('Failed to load data for the chart.');
    });

fetch('http://localhost:3000/word-count')  // Adjust this URL if needed
    .then(response => response.json())
    .then(data => {
        console.log('Top Words Data:', data);

        // Assuming data is in the form of an array of objects like:
        // [{ word: 'example', count: 10 }, {...}, ...]

        const labels = data.map(item => item[0]); // Accessing the word (first element of the array)
        const values = data.map(item => item[1]); // Accessing the count (second element of the array)


        console.log('Words:', labels, 'Counts:', values);

        // Create the new chart for top 15 words
        const ctx = document.getElementById('wordChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',  // You can change the type to 'horizontalBar' if needed
            data: {
                labels: labels,
                datasets: [{
                    label: 'Top 15 Words',
                    data: values,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)', // Adjust color if needed
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            font: {
                                size: 14
                            }
                        }
                    },
                    x: {
                        ticks: {
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
    .catch(error => {
        console.error('Error fetching data:', error);
        alert('Failed to load data for the top words chart.');
    });

