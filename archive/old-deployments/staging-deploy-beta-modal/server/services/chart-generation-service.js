import { createCanvas } from 'canvas';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
const DEFAULT_CHART_CONFIG = {
    width: 600,
    height: 500,
    backgroundColor: '#ffffff',
    fonts: {
        family: 'Segoe UI, sans-serif',
        size: 14,
        weight: 'bold'
    },
    colors: {
        acting: '#f14040',
        thinking: '#01a252',
        feeling: '#167efd',
        planning: '#ffcb2f'
    }
};
export class ChartGenerationService {
    config;
    constructor(config = {}) {
        this.config = { ...DEFAULT_CHART_CONFIG, ...config };
    }
    async generatePieChart(strengths) {
        try {
            console.log('📊 Generating pie chart for strengths:', strengths);
            const canvas = createCanvas(this.config.width, this.config.height);
            const ctx = canvas.getContext('2d');
            const data = {
                labels: ['Acting', 'Feeling', 'Planning', 'Thinking'],
                datasets: [{
                        data: [strengths.acting, strengths.feeling, strengths.planning, strengths.thinking],
                        backgroundColor: [
                            this.config.colors.acting,
                            this.config.colors.feeling,
                            this.config.colors.planning,
                            this.config.colors.thinking
                        ],
                        borderWidth: 2,
                        borderColor: '#ffffff'
                    }]
            };
            const chartConfig = {
                type: 'pie',
                data: data,
                options: {
                    responsive: false,
                    animation: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                font: {
                                    family: this.config.fonts.family,
                                    size: this.config.fonts.size,
                                    weight: this.config.fonts.weight
                                },
                                padding: 20,
                                usePointStyle: true
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: (context) => {
                                    const label = context.label || '';
                                    const value = context.parsed || 0;
                                    return `${label}: ${value}%`;
                                }
                            }
                        }
                    },
                    layout: {
                        padding: {
                            left: 40,
                            right: 40,
                            top: 20,
                            bottom: 20
                        }
                    }
                }
            };
            const chart = new Chart(ctx, chartConfig);
            const base64Image = canvas.toDataURL('image/png');
            chart.destroy();
            console.log('✅ Pie chart generated successfully');
            return base64Image;
        }
        catch (error) {
            console.error('❌ Error generating pie chart:', error);
            throw new Error(`Failed to generate pie chart: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async generateProgressChart(wellBeing) {
        try {
            console.log('📈 Generating progress chart for well-being:', wellBeing);
            const canvas = createCanvas(this.config.width, this.config.height);
            const ctx = canvas.getContext('2d');
            const data = {
                labels: ['Current Well-being', 'Future Well-being (1 year)'],
                datasets: [{
                        label: 'Well-being Level',
                        data: [wellBeing.current, wellBeing.future],
                        backgroundColor: [
                            'rgba(23, 126, 253, 0.6)',
                            'rgba(1, 162, 82, 0.6)'
                        ],
                        borderColor: [
                            this.config.colors.feeling,
                            this.config.colors.thinking
                        ],
                        borderWidth: 2
                    }]
            };
            const chartConfig = {
                type: 'bar',
                data: data,
                options: {
                    responsive: false,
                    animation: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 10,
                            ticks: {
                                stepSize: 1,
                                font: {
                                    family: this.config.fonts.family,
                                    size: this.config.fonts.size
                                }
                            },
                            grid: {
                                color: 'rgba(0, 0, 0, 0.1)'
                            }
                        },
                        x: {
                            ticks: {
                                font: {
                                    family: this.config.fonts.family,
                                    size: this.config.fonts.size,
                                    weight: this.config.fonts.weight
                                }
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: 'Well-being Progress Journey',
                            font: {
                                family: this.config.fonts.family,
                                size: 16,
                                weight: 'bold'
                            }
                        }
                    },
                    layout: {
                        padding: 20
                    }
                }
            };
            const chart = new Chart(ctx, chartConfig);
            const base64Image = canvas.toDataURL('image/png');
            chart.destroy();
            console.log('✅ Progress chart generated successfully');
            return base64Image;
        }
        catch (error) {
            console.error('❌ Error generating progress chart:', error);
            throw new Error(`Failed to generate progress chart: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async generateFlowVisualization(flowData) {
        try {
            console.log('🌊 Generating flow visualization:', flowData);
            const canvas = createCanvas(this.config.width, this.config.height);
            const ctx = canvas.getContext('2d');
            const topAttributes = flowData.attributes.slice(0, 6);
            const data = {
                labels: topAttributes.map(attr => attr.name),
                datasets: [{
                        label: 'Flow Attributes',
                        data: topAttributes.map(attr => attr.score),
                        backgroundColor: 'rgba(23, 126, 253, 0.2)',
                        borderColor: this.config.colors.feeling,
                        borderWidth: 2,
                        pointBackgroundColor: this.config.colors.feeling,
                        pointBorderColor: '#ffffff',
                        pointRadius: 5
                    }]
            };
            const chartConfig = {
                type: 'radar',
                data: data,
                options: {
                    responsive: false,
                    animation: false,
                    scales: {
                        r: {
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                                stepSize: 20,
                                font: {
                                    family: this.config.fonts.family,
                                    size: 10
                                }
                            },
                            grid: {
                                color: 'rgba(0, 0, 0, 0.1)'
                            },
                            pointLabels: {
                                font: {
                                    family: this.config.fonts.family,
                                    size: 12,
                                    weight: this.config.fonts.weight
                                }
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: `Flow Profile (Score: ${flowData.flowScore}/60)`,
                            font: {
                                family: this.config.fonts.family,
                                size: 16,
                                weight: 'bold'
                            }
                        }
                    },
                    layout: {
                        padding: 20
                    }
                }
            };
            const chart = new Chart(ctx, chartConfig);
            const base64Image = canvas.toDataURL('image/png');
            chart.destroy();
            console.log('✅ Flow visualization generated successfully');
            return base64Image;
        }
        catch (error) {
            console.error('❌ Error generating flow visualization:', error);
            throw new Error(`Failed to generate flow visualization: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async generateTimelineChart(visionData) {
        try {
            console.log('📅 Generating timeline chart for vision:', visionData);
            const canvas = createCanvas(this.config.width, this.config.height);
            const ctx = canvas.getContext('2d');
            const data = {
                labels: ['5 Years', '10 Years', '20 Years'],
                datasets: [{
                        label: 'Vision Timeline',
                        data: [1, 2, 3],
                        backgroundColor: [
                            this.config.colors.planning,
                            this.config.colors.thinking,
                            this.config.colors.acting
                        ],
                        borderColor: [
                            this.config.colors.planning,
                            this.config.colors.thinking,
                            this.config.colors.acting
                        ],
                        borderWidth: 2
                    }]
            };
            const chartConfig = {
                type: 'line',
                data: data,
                options: {
                    responsive: false,
                    animation: false,
                    scales: {
                        y: {
                            display: false
                        },
                        x: {
                            ticks: {
                                font: {
                                    family: this.config.fonts.family,
                                    size: this.config.fonts.size,
                                    weight: this.config.fonts.weight
                                }
                            }
                        }
                    },
                    elements: {
                        point: {
                            radius: 8,
                            hoverRadius: 10
                        },
                        line: {
                            tension: 0.4
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: 'Future Vision Timeline',
                            font: {
                                family: this.config.fonts.family,
                                size: 16,
                                weight: 'bold'
                            }
                        }
                    },
                    layout: {
                        padding: 20
                    }
                }
            };
            const chart = new Chart(ctx, chartConfig);
            const base64Image = canvas.toDataURL('image/png');
            chart.destroy();
            console.log('✅ Timeline chart generated successfully');
            return base64Image;
        }
        catch (error) {
            console.error('❌ Error generating timeline chart:', error);
            throw new Error(`Failed to generate timeline chart: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async generateAllCharts(userData) {
        const charts = {};
        try {
            if (userData.assessments?.starCard) {
                charts.pieChart = await this.generatePieChart(userData.assessments.starCard);
            }
            if (userData.assessments?.cantrilLadder) {
                charts.progressChart = await this.generateProgressChart({
                    current: userData.assessments.cantrilLadder.wellBeingLevel || 0,
                    future: userData.assessments.cantrilLadder.futureWellBeingLevel || 0,
                    improvements: []
                });
            }
            if (userData.assessments?.flowAssessment && userData.assessments?.flowAttributes?.attributes) {
                charts.flowChart = await this.generateFlowVisualization({
                    flowScore: userData.assessments.flowAssessment.flowScore || 0,
                    attributes: userData.assessments.flowAttributes.attributes || []
                });
            }
            if (userData.assessments?.futureSelfReflection) {
                charts.timelineChart = await this.generateTimelineChart({
                    fiveYear: userData.assessments.futureSelfReflection.fiveYearFoundation || '',
                    tenYear: userData.assessments.futureSelfReflection.tenYearMilestone || '',
                    twentyYear: userData.assessments.futureSelfReflection.twentyYearVision || '',
                    milestones: []
                });
            }
            console.log(`✅ Generated ${Object.keys(charts).length} charts successfully`);
            return charts;
        }
        catch (error) {
            console.error('❌ Error generating charts:', error);
            throw error;
        }
    }
}
export const chartGenerator = new ChartGenerationService();
