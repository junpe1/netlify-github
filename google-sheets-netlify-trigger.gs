const NETLIFY_BUILD_HOOK_URL = "https://api.netlify.com/build_hooks/PASTE_YOUR_BUILD_HOOK_ID";

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Site")
    .addItem("Netlifyを更新", "deploySite")
    .addToUi();
}

function deploySite() {
  UrlFetchApp.fetch(NETLIFY_BUILD_HOOK_URL, {
    method: "post",
    muteHttpExceptions: true,
  });
  SpreadsheetApp.getActive().toast("Netlifyの更新を開始しました。");
}
