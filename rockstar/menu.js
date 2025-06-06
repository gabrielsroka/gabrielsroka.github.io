// results.innerText = location.href;
document.addEventListener('DOMContentLoaded', function () {
  const checkbox = document.getElementById('autoPopupCheckbox');

  // Load stored value (default: true)
  chrome.storage.local.get({ autoPopup: true }, function (result) {
    checkbox.checked = result.autoPopup;
  });

  // Save new value on change
  checkbox.addEventListener('change', function () {
    chrome.storage.local.set({ autoPopup: checkbox.checked });
  });
});
