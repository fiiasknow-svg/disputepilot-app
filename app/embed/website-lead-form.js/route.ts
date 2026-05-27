export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const body = `(function(){
  var script = document.currentScript;
  var iframe = document.createElement("iframe");
  iframe.src = "${origin}/public/forms/website-lead-form";
  iframe.title = "DisputePilot Website Lead Form";
  iframe.style.width = "100%";
  iframe.style.minHeight = "620px";
  iframe.style.border = "0";
  iframe.style.display = "block";
  iframe.setAttribute("data-disputepilot-embed", "website-lead-form");
  if (script && script.parentNode) script.parentNode.insertBefore(iframe, script.nextSibling);
})();`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
