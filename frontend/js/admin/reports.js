/**
 * EventSphere — Admin Reports
 */

const AdminReports = {
  type: 'users',
  rows: [],
  columns: [],

  init() {
    if (!AdminLayout.init({ page: 'reports', title: 'Reports', crumb: ['Reports'] })) return;

    document.querySelectorAll('[data-type]').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-type]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.type = btn.dataset.type;
        this.run();
      });
    });

    document.querySelector('[data-run]').addEventListener('click', () => this.run());
    document.querySelector('[data-export-csv]').addEventListener('click', () => this.exportCsv());
    document.querySelector('[data-print]').addEventListener('click', () => this.print());
    this.run();
  },

  params() {
    const p = {};
    const from = document.querySelector('[data-from]').value;
    const to = document.querySelector('[data-to]').value;
    if (from) p.from = from;
    if (to) p.to = to;
    return p;
  },

  async run() {
    const body = document.getElementById('reportBody');
    const card = document.getElementById('reportPreviewCard');
    card.style.display = 'block';
    body.innerHTML = AdminLayout.skeletonRows(8, 4);
    document.querySelector('[data-report-title]').textContent =
      this.type[0].toUpperCase() + this.type.slice(1) + ' Report';

    try {
      const data = await API.get(`/admin/reports/${this.type}`, this.params());
      this.rows = data.rows || [];
      this.columns = this.rows.length ? Object.keys(this.rows[0]) : [];
      this.render();

      document.querySelector('[data-export-csv]').disabled = !this.rows.length;
      document.querySelector('[data-print]').disabled = !this.rows.length;
    } catch (err) {
      AdminLayout.handleApiError(err);
      body.innerHTML = `<tr><td colspan="8">${AdminLayout.errorState({ code: '500', title: 'Report failed', desc: err.message, action: '<button class="admin-btn admin-btn-secondary admin-btn-sm" onclick="AdminReports.run()">Retry</button>' })}</td></tr>`;
    }
  },

  render() {
    const head = document.getElementById('reportHead');
    const body = document.getElementById('reportBody');
    const countEl = document.querySelector('[data-report-count]');
    const meta = document.querySelector('[data-report-meta]');

    if (!this.rows.length) {
      head.innerHTML = '';
      body.innerHTML = `<tr><td>${AdminLayout.emptyState({ icon: '📄', title: 'No records found', desc: 'No data exists for this report type and date range.', action: '<button class="admin-btn admin-btn-secondary admin-btn-sm" onclick="AdminReports.resetRange()">Clear Date Range</button>' })}</td></tr>`;
      countEl.textContent = '0 records';
      meta.textContent = 'Nothing to show for the current selection';
      return;
    }

    const fmt = (key, val) => {
      if (val === null || val === undefined || val === '') return '—';
      if (/date|joined|created|purchased|checkin|checked/i.test(key)) {
        const d = new Date(val);
        return isNaN(d.getTime()) ? String(val) : Utils.formatDate(val);
      }
      if (/amount|revenue|total|price|subtotal/i.test(key)) {
        return AdminLayout.money(val);
      }
      if (/rating/i.test(key)) return String(val) + ' ★';
      return String(val);
    };

    head.innerHTML = `<tr>${this.columns.map((c) => `<th>${Utils.escapeHtml(c.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/^\w/, (m) => m.toUpperCase()))}</th>`).join('')}</tr>`;

    body.innerHTML = this.rows.map((r) =>
      `<tr>${this.columns.map((c) => `<td>${Utils.escapeHtml(fmt(c, r[c]))}</td>`).join('')}</tr>`
    ).join('');

    countEl.textContent = `${this.rows.length} record${this.rows.length === 1 ? '' : 's'}`;
    meta.textContent = `Generated ${new Date().toLocaleString()}`;
  },

  resetRange() {
    document.querySelector('[data-from]').value = '';
    document.querySelector('[data-to]').value = '';
    this.run();
  },

  exportCsv() {
    const token = API.getToken();
    const params = new URLSearchParams(this.params());
    params.set('format', 'csv');
    const url = `/api/admin/reports/${this.type}?${params.toString()}`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!res.ok) throw new Error('Export failed');
        return res.blob();
      })
      .then((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${this.type}-report.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(blob);
        AdminLayout.toast('Report exported', 'success');
      })
      .catch((err) => AdminLayout.handleApiError(err));
  },

  print() {
    const printWindow = window.open('', '_blank', 'width=1000,height=700');
    if (!printWindow) {
      AdminLayout.toast('Please allow popups to print', 'warning');
      return;
    }
    const title = `${this.type[0].toUpperCase()}${this.type.slice(1)} Report — EventSphere`;
    printWindow.document.write(`<!DOCTYPE html><html><head><title>${title}</title><style>
      body{font-family:Inter,Arial,sans-serif;padding:32px;color:#0F172A;}
      h1{font-size:20px;margin-bottom:4px;} h2{font-size:14px;color:#64748B;font-weight:500;margin-bottom:20px;}
      table{width:100%;border-collapse:collapse;font-size:12px;}
      th{text-align:left;padding:8px 10px;background:#F1F5F9;text-transform:uppercase;letter-spacing:.05em;font-size:10px;color:#475569;border-bottom:1px solid #E2E8F0;}
      td{padding:8px 10px;border-bottom:1px solid #E2E8F0;}
      .meta{font-size:11px;color:#94A3B8;margin-bottom:16px;}
    </style></head><body>
      <h1>${title}</h1>
      <h2>EventSphere Platform Report</h2>
      <div class="meta">Generated ${new Date().toLocaleString()} · ${this.rows.length} records</div>
      <table>
        <thead><tr>${this.columns.map((c) => `<th>${Utils.escapeHtml(c)}</th>`).join('')}</tr></thead>
        <tbody>${this.rows.map((r) => `<tr>${this.columns.map((c) => `<td>${Utils.escapeHtml(r[c] === undefined || r[c] === null ? '' : r[c])}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>
      <script>window.onload=function(){window.print();}<\/script>
    </body></html>`);
    printWindow.document.close();
  }
};

document.addEventListener('DOMContentLoaded', () => AdminReports.init());
window.AdminReports = AdminReports;