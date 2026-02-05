const Ads = {
    showBanner() {
        console.log("AdSense: Displaying Banners on Menu/Game Over");
        try {
            (adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {}
    }
};