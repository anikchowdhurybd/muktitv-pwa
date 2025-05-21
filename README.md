# muktitv-pwa

Step-by-Step Guide to Convert Your Blogspot Site to a PWA
This guide will walk you through creating the necessary files, hosting them, and integrating them into your Blogspot theme.

Important Prerequisite: HTTPS
PWAs require your site to be served over HTTPS. Fortunately, Blogspot sites (yourname.blogspot.com) are automatically served over HTTPS, so this is already handled. If you're using a custom domain, ensure HTTPS is enabled in your Blogspot settings.

Step 1: Prepare Your PWA Icons

You'll need at least two icons for your PWA:

A 192x192 pixels PNG image.

A 512x512 pixels PNG image.

These icons will be used for the home screen shortcut, splash screen, etc.

Make sure they have a transparent background or a background that looks good. The purpose: "any maskable" property in the manifest means the icon should be designed to look good when the OS masks its shape (e.g., into a circle or rounded square).

You can use tools like:

Favicon.io (can generate various sizes from one image)

Maskable.app Editor (to check/create maskable icons)

Crucially, you will need to upload these icons somewhere publicly accessible to get their absolute URLs. (More on this in Step 3).

Step 2: Create the manifest.json File

Open a plain text editor (like Notepad on Windows, TextEdit on Mac in plain text mode, or VS Code).

Copy the manifest.json code I provided earlier into this file.

Customize the manifest:

name: "Mukti TV" (or as you prefer)

short_name: "MuktiTV" (a shorter version)

description: A brief description of your site.

background_color: Used for the splash screen before your CSS loads.

theme_color: Suggests a color for the browser UI (toolbar).

start_url: /?utm_source=pwa is good. It ensures users start at your homepage and you can track PWA visits if you use analytics.

icons: This is important. You will need to replace "REPLACE_WITH_ABSOLUTE_URL_TO_ICON_192x192.png" and "REPLACE_WITH_ABSOLUTE_URL_TO_ICON_512x512.png" with the actual, publicly accessible URLs of the icons you prepared in Step 1, once you've hosted them (see Step 3).

Save the file as manifest.json.

Step 3: Create the sw.js (Service Worker) File

Open another plain text file in your editor.

Copy the sw.js code I provided.

Customize the sw.js file:

CACHE_NAME: You can leave this as muktitv-cache-v1. If you make significant changes to the service worker or cached files later, you'll increment the version (e.g., muktitv-cache-v2) to trigger an update.

urlsToCache:

'/': Caches your homepage.

'/offline.html': You need to create a static page in Blogspot named "offline.html" (or whatever you call it). This page will be shown when the user is offline and tries to access a page that isn't cached.

To create this in Blogspot: Go to Pages > New Page. Title it "Offline" (the URL will likely become⁣offline.html). Add some simple content like "You are currently offline. Please check your internet connection." Publish it.

Critical CSS/JS (Optional but Recommended): Identify any critical CSS or JavaScript files that are part of your Blogspot theme and are essential for the basic look and feel. You can find their paths by inspecting your site's source code in the browser. Add their relative paths to this array (e.g., '/path/to/your/style.css'). Be careful not to cache too much or files that change very frequently with this basic strategy.

Save the file as sw.js.

Step 4: Host manifest.json, sw.js, and Your Icons

This is the trickiest part with Blogspot, as it doesn't allow direct uploading of .json or .js files to the root directory of your blog or provide a straightforward way to serve them with the correct MIME types from its own hosting.

Recommended Solution: Use a Free Hosting Service like GitHub Pages or Firebase Hosting.

GitHub Pages (Easiest for this purpose):

Create a new public repository on GitHub (e.g., my-pwa-assets).

Upload your manifest.json, sw.js, and your icon image files (e.g., icon-192x192.png, icon-512x512.png) into this repository.

Go to the repository's Settings > Pages.

Under "Branch," select main (or master) and the / (root) folder, then click Save.

GitHub will give you a URL like https://your-username.github.io/my-pwa-assets/.

Your files will then be accessible at:

https://your-username.github.io/my-pwa-assets/manifest.json

https://your-username.github.io/my-pwa-assets/sw.js

https://your-username.github.io/my-pwa-assets/icon-192x192.png

https://your-username.github.io/my-pwa-assets/icon-512x512.png

Update your manifest.json file (the local copy first, then re-upload to GitHub) with these absolute URLs for the icons.

Other options:

Firebase Hosting: Also free and very robust. A bit more setup involved.

Netlify Drop: Simple drag-and-drop hosting.

Cloudinary or similar for images: If you only need to host images, these are good options.

Once hosted, you will have absolute URLs for manifest.json, sw.js, and your icons. Keep these URLs handy.

Step 5: Edit Your Blogspot Theme HTML

Go to your Blogspot Dashboard.

Navigate to Theme.

Click on the three dots (or "Customize" dropdown) under your current theme and select Edit HTML.

Backup your theme first! Click "Backup" before making any changes.

Add the Manifest Link:

Find the <head> section in your HTML. It usually starts near the top of the code.

Inside the <head> section, add the following line, replacing YOUR_ABSOLUTE_URL_TO_MANIFEST.JSON with the actual URL from Step 4:

<link rel="manifest" href="YOUR_ABSOLUTE_URL_TO_MANIFEST.JSON">

Also, add theme color meta tag for iOS compatibility:

<meta name="theme-color" content="#000000"/> <meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="MuktiTV">

(You'd need to create and host an apple-touch-icon.png similar to your other icons).

Register the Service Worker:

Scroll down to the bottom of your HTML, just before the closing </body> tag.

Add the following JavaScript code, replacing YOUR_ABSOLUTE_URL_TO_SW.JS with the actual URL from Step 4:

<script type="text/javascript">
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('YOUR_ABSOLUTE_URL_TO_SW.JS', { scope: '/' }) // Ensure scope is '/'
        .then(function(registration) {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        })
        .catch(function(err) {
          console.log('ServiceWorker registration failed: ', err);
        });
    });
  }
</script>

Important: The scope: '/' option tells the browser that the service worker should control all pages under your main domain. If your sw.js is hosted on a different domain (like GitHub Pages), there might be scope restrictions. Ideally, the service worker should be served from the same origin as your site.

If using GitHub Pages for sw.js: The service worker will only be able to control pages within the scope of https://your-username.github.io/. This is a limitation. To properly control yourname.blogspot.com, the sw.js file must be served from yourname.blogspot.com.

Workaround for sw.js hosting on Blogspot (Advanced & Limited):

You could try to inline the entire service worker script directly within the <script> tags in your Blogspot HTML. However, this is generally not recommended for maintainability and because Blogspot might have limits on script tag sizes or content.

A slightly better but still complex approach for Blogspot could be to store the sw.js content as a Blogspot Page (in HTML mode, wrapped in <script>) and then try to load and register it from there, but this is hacky and might not work reliably due to MIME type issues or other restrictions.

The most robust way is to use a custom domain with Blogspot and then host your sw.js on a CDN or hosting that allows you to serve it from a path on your custom domain (e.g., using proxy rules if your CDN supports it). This is more advanced.

For now, try with the GitHub Pages URL. The "Add to Home Screen" might still work, but full offline caching for the Blogspot domain itself might be limited by cross-origin security policies for service workers. The service worker will operate on the GitHub Pages origin.

Save your theme changes.

Step 6: Test Your PWA

Clear your browser cache for your Blogspot site.

Open your Blogspot site in Chrome (or another PWA-supporting browser).

Open Developer Tools (usually by pressing F12 or right-clicking and selecting "Inspect").

Manifest: Go to the "Application" tab (in Chrome), then "Manifest" in the sidebar. You should see your manifest details loaded. If there are errors, they'll be listed.

Service Workers: Go to the "Application" tab, then "Service Workers." You should see your sw.js listed as activated and running. You can use the "Update on reload" option for testing. Check the console for any registration errors.

Lighthouse: Go to the "Lighthouse" tab. Select "Progressive Web App" and run an audit. This will give you a checklist of PWA requirements and tell you what's passing or failing.

Test "Add to Home Screen":

On Desktop Chrome: You should see an install icon (often a down arrow in a circle) in the address bar.

On Android Chrome: You should get a prompt or be able to select "Add to Home screen" from the browser menu.

Test Offline Capability:

In Developer Tools > Application > Service Workers, check the "Offline" box to simulate being offline.

Try navigating to your homepage or other pages you intended to cache. You should see the cached version or your offline.html page.

Troubleshooting & Considerations:

URLs in sw.js: Ensure paths in urlsToCache are correct relative to your Blogspot domain (e.g., /, /p/about.html, /2023/05/your-post.html). However, given the cross-origin issue for sw.js if hosted on GitHub, it will primarily cache resources from its own origin unless CORS headers allow caching of cross-origin resources. The offline.html in urlsToCache should be the Blogspot page.

Service Worker Scope and Origin: This is the main challenge with Blogspot. A service worker script (sw.js) generally needs to be served from the same origin as the site it's controlling to have full capabilities (like intercepting fetch requests for your Blogspot pages). If sw.js is on GitHub Pages, its scope is limited to that origin. The "Add to Home Screen" might still work based on the manifest (linked from Blogspot), but the service worker's offline caching for your Blogspot content will be tricky.

Updating Your Service Worker: If you change sw.js, you need to:

Update the CACHE_NAME (e.g., muktitv-cache-v2).

Upload the new sw.js to your hosting.
The browser will detect the change, install the new worker, and activate it (usually after all tabs using the old worker are closed or self.skipWaiting() and self.clients.claim() are used).

Dynamic Content: The provided service worker uses a simple cache-first strategy. For a blog with frequently updated content, you'd want a more sophisticated strategy like "Network first, then cache" or "Stale-while-revalidate" for blog posts. This basic setup is more for the app shell and an offline fallback.

This is a complex process, especially with the limitations of Blogspot's hosting. The key challenge is serving the sw.js file from the same origin as your Blogspot site. If you move to a custom domain with Blogspot, you might have more options for serving the sw.js via a CDN that can proxy requests.

Start with these steps, focusing on getting the manifest linked correctly and the service worker registered, even if its offline capabilities are initially limited due to cross-origin restrictions. The Lighthouse audit will be your best friend in diagnosing issues.
