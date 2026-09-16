let clerkReady = false;

window.addEventListener('load', async () => {
  try {
    await Clerk.load({
      ui: { ClerkUI: window.__internal_ClerkUICtor }
    });

    clerkReady = true;
    updateAuthUI();
    window.dispatchEvent(new Event('auth:ready'));

    Clerk.addListener(({ user }) => {
      updateAuthUI();
      window.dispatchEvent(new Event('auth:changed'));
    });
  } catch (error) {
    console.error('Clerk failed to load:', error);
  }
});

function updateAuthUI() {
  if (!clerkReady) return;

  const container = document.getElementById('auth-container');
  if (!container) return;

  if (Clerk.user) {
    container.innerHTML = '<button class="nav-btn" id="logout-btn">Sign Out</button>';
    document.getElementById('logout-btn').onclick = signOut;
  } else {
    container.innerHTML = '<button class="nav-btn" id="login-btn">Sign In</button>';
    document.getElementById('login-btn').onclick = signIn;
  }
}

function isLoggedIn() {
  return clerkReady && !!Clerk.user;
}

function signIn() {
  if (clerkReady) Clerk.openSignIn();
}

async function signOut() {
  if (!clerkReady) return;
  await Clerk.signOut();
}

async function getAuthToken() {
  if (!isLoggedIn() || !Clerk.session) return null;
  return Clerk.session.getToken();
}
