(function () {
  function updateSeoulTheme() {
    var hour = Number(new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Seoul',
      hour: '2-digit',
      hourCycle: 'h23'
    }).format(new Date()));

    document.documentElement.dataset.seoulNight =
      hour >= 18 || hour < 6 ? 'true' : 'false';
  }

  updateSeoulTheme();
  window.setInterval(updateSeoulTheme, 15000);
})();
