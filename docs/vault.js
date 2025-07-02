document.addEventListener('DOMContentLoaded', () => {
  const logs = [
    {
      timestamp: '2025-07-03T00:10:12Z',
      agent: 'OutreachSignal',
      action: 'Thread Generation',
      status: 'success',
      message: 'Published 3 hooks to Twitter feed queue'
    },
    {
      timestamp: '2025-07-02T23:50:05Z',
      agent: 'SyncNode',
      action: 'Product summary chain failed',
      status: 'error',
      message: 'LangChain callback timeout @ MemoryReducer'
    },
    {
      timestamp: '2025-07-02T23:45:00Z',
      agent: 'ResonantFeedback',
      action: 'Transcript processed',
      status: 'success',
      message: 'Converted 91% of client voice note into structured prompt'
    },
    {
      timestamp: '2025-07-02T23:42:17Z',
      agent: 'SyncNode',
      action: 'MVP Product Tree generated',
      status: 'warning',
      message: 'Only 2 categories returned (Branding, Tech Setup)'
    }
  ];

  const logFeed = document.getElementById('logFeed');
  const agentFilter = document.getElementById('agentFilter');

  function renderLogs() {
    logFeed.innerHTML = '';
    const selected = agentFilter.value;
    logs
      .filter(log => selected === 'all' || log.agent === selected)
      .forEach(log => {
        const div = document.createElement('div');
        div.className = `log-entry status-${log.status}`;
        div.innerHTML = `
          <h3>${log.agent} | <code>${log.timestamp}</code></h3>
          <strong>${log.action}</strong><br>
          <em>${log.message}</em>
        `;
        logFeed.appendChild(div);
      });
  }

  agentFilter.addEventListener('change', renderLogs);
  renderLogs();
});