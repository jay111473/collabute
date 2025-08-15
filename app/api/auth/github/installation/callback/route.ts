import { NextRequest, NextResponse } from "next/server";
import { setAuthStatus } from "../../status/route";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const installationId = searchParams.get("installation_id");
  const setupAction = searchParams.get("setup_action");
  const state = searchParams.get("state");

  // Verify state parameter for CSRF protection
  if (!state) {
    console.error("Missing state parameter");
    return createPopupResponse("invalid_state", "Missing state parameter");
  }

  // Decode state parameter to get redirect information
  let redirectInfo;
  try {
    redirectInfo = JSON.parse(atob(state));
  } catch (error) {
    console.error("Invalid state parameter:", error);
    return createPopupResponse("invalid_state", "Invalid state parameter");
  }

  // Check if this is a popup flow
  const isPopup = redirectInfo.popup === true;
  const statusId = redirectInfo.statusId;

  // Check if this is a new installation
  if (setupAction === "install" && installationId) {
    // Store the installation ID for later use
    // You'll need to associate this with the user's account

    if (isPopup && statusId) {
      // Update auth status for popup flow
      setAuthStatus(statusId, {
        status: 'success',
        userId: installationId // Store installation ID as userId for now
      });

      // Return popup close response
      return createPopupResponse("success", "GitHub App installed successfully", installationId);
    } else {
      // Fallback to redirect flow
      const redirectUrl = new URL("/onboarding", redirectInfo.origin || request.nextUrl.origin);
      redirectUrl.searchParams.set("step", redirectInfo.step || "github");
      redirectUrl.searchParams.set("type", redirectInfo.type || "developer");
      redirectUrl.searchParams.set("github_app_installed", "true");
      redirectUrl.searchParams.set("installation_id", installationId);

      return NextResponse.redirect(redirectUrl.toString());
    }
  }

  // Handle errors
  if (isPopup && statusId) {
    setAuthStatus(statusId, {
      status: 'error',
      error: 'Installation failed or was cancelled'
    });
    return createPopupResponse("error", "Installation failed or was cancelled");
  }

  // Fallback redirect for non-popup flow
  return NextResponse.redirect(
    `${redirectInfo.origin || request.nextUrl.origin}/onboarding?github_error=installation_failed`
  );
}

function createPopupResponse(status: string, message: string, installationId?: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>GitHub Authentication</title>
      <meta charset="utf-8">
    </head>
    <body>
      <script>
        // Send message to parent window
        if (window.opener && window.opener !== window) {
          window.opener.postMessage({
            type: 'github-auth-complete',
            status: '${status}',
            message: '${message}',
            installationId: '${installationId || ''}'
          }, '*');
        }
        
        // Close popup window
        window.close();
      </script>
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; padding: 50px;">
        <h2>${status === 'success' ? '✅' : '❌'} ${message}</h2>
        <p>This window will close automatically...</p>
        <script>
          // Fallback close after 3 seconds
          setTimeout(() => {
            window.close();
          }, 3000);
        </script>
      </div>
    </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
