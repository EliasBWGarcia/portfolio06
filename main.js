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
