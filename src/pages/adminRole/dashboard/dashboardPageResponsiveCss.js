/** Shared responsive layout for Insights + Dashboard pages (admin + client slug sessions). */
export const DASHBOARD_PAGE_RESPONSIVE_CSS = `
.liminal-page-shell{max-width:900px;margin:0 auto;padding:20px 16px;box-sizing:border-box}
@media (max-width:600px){
  .liminal-page-shell{padding:16px 12px}
}
.liminal-page-head{display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between;margin-bottom:3px}
.liminal-page-head-title{font-family:'Nunito Sans',sans-serif;font-size:22px;font-weight:800;margin:0;line-height:1.2;flex:1 1 200px;min-width:0;overflow-wrap:anywhere}
.liminal-page-head-btn{flex:0 1 auto;padding:8px 16px;border-radius:9px;border:none;font-size:12px;font-weight:700;cursor:pointer}
@media (max-width:520px){
  .liminal-page-head{flex-direction:column;align-items:stretch;gap:10px}
  .liminal-page-head-title{font-size:clamp(17px,5.5vw,22px);flex:0 0 auto;width:100%}
  .liminal-page-head-btn{width:100%;min-height:44px}
}
.liminal-page-filters{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.liminal-page-filter-group{display:flex;align-items:center;gap:6px;flex:1 1 160px;min-width:0}
.liminal-page-filter-group select{flex:1;min-width:0;max-width:100%}
.liminal-insights-stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px}
@media (max-width:560px){
  .liminal-insights-stat-grid{grid-template-columns:1fr}
}
`;

/** Amy admin dashboard: program picker + dates / refresh (above Insights & Dashboard). */
export const ADMIN_PROGRAM_BAR_CSS = `
.liminal-admin-toolbar-wrap{max-width:900px;margin:14px auto 0;padding:0 16px;box-sizing:border-box}
@media (max-width:600px){
  .liminal-admin-toolbar-wrap{padding:0 12px;margin-top:10px}
}
.liminal-admin-toolbar-card{background:#fff;border:1.5px solid #e2e8f0;border-radius:12px;padding:10px 12px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;box-shadow:0 1px 6px #0000000a}
.liminal-admin-toolbar-program{display:flex;align-items:center;gap:8px;flex:1 1 240px;min-width:0}
.liminal-admin-toolbar-program select{flex:1;min-width:0;max-width:100%}
@media (min-width:901px){
  .liminal-admin-toolbar-program select{max-width:280px}
}
.liminal-admin-toolbar-actions{display:flex;align-items:center;gap:12px;flex-wrap:wrap;justify-content:flex-end;flex:1 1 300px;min-width:0}
.liminal-admin-toolbar-date{font-size:11px;color:#64748b;white-space:normal;text-align:right;line-height:1.45;max-width:100%}
.liminal-admin-toolbar-count{font-size:11px;font-weight:700;color:#0092E7;white-space:nowrap}
@media (max-width:900px){
  .liminal-admin-toolbar-card{align-items:stretch}
  .liminal-admin-toolbar-program{flex:1 1 100%;width:100%}
  .liminal-admin-toolbar-actions{flex:1 1 100%;width:100%;justify-content:flex-start}
  .liminal-admin-toolbar-date{text-align:left}
}
@media (max-width:520px){
  .liminal-admin-toolbar-card{padding:12px 10px;gap:10px}
  .liminal-admin-toolbar-actions{flex-direction:column;align-items:stretch;gap:10px}
  .liminal-admin-toolbar-actions > button{width:100%;min-height:42px;box-sizing:border-box}
  .liminal-admin-toolbar-count{text-align:center}
}
.liminal-admin-empty-wrap{max-width:900px;margin:20px auto 0;padding:0 16px;box-sizing:border-box}
@media (max-width:600px){
  .liminal-admin-empty-wrap{padding:0 12px;margin-top:14px}
}
`;
