/**
 * EventSphere — Analytics & Interactive Chart.js Visualizations
 */

const Analytics = {
  revenueChart: null,
  tierChart: null,

  async init() {
    if (!Auth.requireAuth(['organizer', 'admin'])) return;
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js not loaded yet');
      return;
    }

    try {
      const data = await API.get('/analytics/revenue');
      this.renderRevenueChart(data.labels, data.revenue);
      this.renderTierChart(data.tierDistribution);
    } catch (err) {
      Components.showToast(`Failed to load analytics: ${err.message}`, 'error');
    }
  },

  renderRevenueChart(labels, values) {
    const ctx = document.getElementById('revenueChartCanvas');
    if (!ctx) return;

    if (this.revenueChart) {
      this.revenueChart.destroy();
    }

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#94A3B8' : '#64748B';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)';

    this.revenueChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels || ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
        datasets: [
          {
            label: 'Monthly Revenue (₹)',
            data: values || [12000, 19000, 24000, 21000, 32000, 28000],
            borderColor: '#6366F1',
            backgroundColor: 'rgba(99, 102, 241, 0.12)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#6366F1',
            pointRadius: 4,
            pointHoverRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
            titleColor: isDark ? '#FFFFFF' : '#0F172A',
            bodyColor: isDark ? '#E2E8F0' : '#334155',
            borderColor: isDark ? '#374151' : '#E2E8F0',
            borderWidth: 1,
            callbacks: {
              label: (ctx) => `Revenue: ${Utils.formatCurrency(ctx.raw)}`
            }
          }
        },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: { color: textColor }
          },
          y: {
            grid: { color: gridColor },
            ticks: {
              color: textColor,
              callback: (value) => `₹${value / 1000}k`
            }
          }
        }
      }
    });
  },

  renderTierChart(distribution) {
    const ctx = document.getElementById('tierChartCanvas');
    if (!ctx) return;

    if (this.tierChart) {
      this.tierChart.destroy();
    }

    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#94A3B8' : '#64748B';

    const labels = Object.keys(distribution || { Standard: 140, VIP: 60, Premium: 40 });
    const dataVals = Object.values(distribution || { Standard: 140, VIP: 60, Premium: 40 });

    this.tierChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data: dataVals,
            backgroundColor: ['#6366F1', '#8B5CF6', '#06B6D4'],
            borderWidth: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: textColor,
              boxWidth: 12,
              padding: 16
            }
          }
        },
        cutout: '70%'
      }
    });
  }
};

window.Analytics = Analytics;
