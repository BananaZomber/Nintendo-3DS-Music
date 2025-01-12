let audio = new Audio();

let audioSource = {
    settings: '/audio/amiibo-settings.mp3',
    shopping: '/audio/eShop-alternative.mp3',
    health: '/audio/health-and-safety.mp3'
};

const regex = {
    settings: /(duolingo|github|reddit|spotify|tutanota)\.\w{2,3}.*\/(settings|preferences)|about:(?!newtab)/,
    shopping: /(?<!\.)(www\.)?(adidas|alibaba|amazon|asos|bestbuy|costco|ebay|etsy|flipkart|idealo|myntra|newegg|nike|overstock|puma|rakuten|sephora|shopify|target|ulta|walmart|zalando|zappos|zara)\./
};

setInterval(() => {
    browser.tabs.query({ active: true, currentWindow: true })
        .then((tabs) => {
            const activeTab = tabs[0];
            const url = activeTab.url;

            if (regex.settings.test(url)) {
                if (audio.paused) {
                    audio.src = audioSource.settings;
                    audio.play();
                    navigator.mediaSession.metadata = new MediaMetadata({
                        title: 'Settings',
                        artist: 'Nintendo 3DS Music',
                        artwork: [
                            { src: '/images/settings-icon.png', sizes: '256x256', type: 'image/png' }
                        ]
                    });
                };
            } else if (regex.shopping.test(url)) {
                if (audio.paused) {
                    audio.src = audioSource.shopping;
                    audio.play();
                    navigator.mediaSession.metadata = new MediaMetadata({
                        title: 'Shopping',
                        artist: 'Nintendo 3DS Music',
                        artwork: [
                            { src: '/images/eshop-icon.png', sizes: '256x256', type: 'image/png' }
                        ]
                    });
                };
            } else if (!regex.settings.test(url) && !regex.shopping.test(url) && !audio.paused && !audio.src.includes(audioSource.health)) {
                audio.pause();
            };
        });
}, 1000);

browser.runtime.onMessage.addListener((message) => {
    if (message.type === 'updateSettingsAudio') {
        audioSource.settings = '/audio/' + message.source;
        audioSource.settings = '/audio/' + message.source;
        audio.src = audioSource.settings;
    };
});

browser.runtime.onMessage.addListener((message) => {
    if (message.type === 'updateShoppingAudio') {
        if (audioSource.shopping != '/audio/' + message.source) {
            audioSource.shopping = '/audio/' + message.source;
            audio.src = audioSource.shopping;
        };
    };
});

browser.runtime.onMessage.addListener((message) => {
    if (message.type === 'updateVolume') {
        audio.volume = message.volume / 100;
    };
});

browser.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        const notificationOptions = {
            type: 'basic',
            iconUrl: browser.extension.getURL('/images/warning.png'),
            title: 'WARNING - HEALTH AND SAFETY',
            message: 'BEFORE PLAYING, READ THE HEALTH AND SAFETY PRECAUTIONS BOOKLET FOR IMPORTANT INFORMATION ABOUT YOUR HEALTH AND SAFETY.',
        };

        browser.notifications.create(notificationOptions, (notificationId) => {
            browser.notifications.onClicked.addListener((clickedNotificationId) => {
                if (clickedNotificationId === notificationId) {
                    browser.tabs.create({ url: '/pages/health-and-safety.txt' });
                }
            });
        });

        audio.src = audioSource.health;
        audio.volume = 0.1;
        audio.play();
    }
});
