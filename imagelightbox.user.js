// ==UserScript==
// @name         Github Image Lightbox
// @description  Opens Github image links in a lightbox instead of opening it in a completely new tab. Lightboxed images displayed are smaller than it's original size.
// @homepage     https://github.com/pigeonburger/github-lightbox
// @author       @pigeonburger
// @version      1.0.1
// @include      https://github.com/*
// @require https://cdnjs.cloudflare.com/ajax/libs/jquery/3.5.1/jquery.min.js
// @grant none
// ==/UserScript==

(function() {
    'use strict';

    const lbSelector = 'a[href$=".jpg"], a[href$=".png"], a[href$=".gif"], a[href*="camo.githubusercontent.com"]';

    jQuery.getCachedScript = function(url, callback) {
        return $.ajax({
            url: url,
            dataType: 'script',
            cache: true
        }).done(callback);
    };

    function linkUnlinkedImages() {
        $('img').not('.js-checked-link').addClass('js-checked-link').filter(function() {
            return typeof this.parentNode.href === 'undefined' && !this.parentNode.classList.value.split(' ').some(v => ignoredParentClasses.includes(v));
        }).wrap(function() {
            return `<a class="js-was-unlinked" data-src="${this.src}"></a>`;
        });

        $('.js-was-unlinked').each(function() {
            const img = this.children[0];
            if(typeof img === 'undefined') return;

            if(img.width >= 100 && img.width < img.naturalWidth) {
                this.href = this.dataset.src;
                this.classList.add('image-lightbox');
            }
            else {
                this.removeAttribute('href');
                this.classList.remove('image-lightbox');
            }
        });
    }


    function doPageload() {
        $('a[href^="https://user-images.githubusercontent.com/"], a[href^="https://camo.githubusercontent.com/"]').attr('href', (i,v) => v.match(/\.(jpg|png|gif)/) != null ? v : v + '');

        $(window).on('load resize', function() {
            linkUnlinkedImages();
        });

        $(`<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/fancybox/3.3.5/jquery.fancybox.min.css">`).appendTo(document.body);
        $.getCachedScript('https://cdnjs.cloudflare.com/ajax/libs/fancybox/3.3.5/jquery.fancybox.min.js', function() {
            $().fancybox({
                selector : lbSelector
            });
        });

        setInterval(() => {
            linkUnlinkedImages();

            $(lbSelector).addClass('image-lightbox')
                .not('.js-lightbox-init').addClass('js-lightbox-init').fancybox();

        }, 2000);
    }


    function appendStyles() {

        const styles = `
<style>
.js-was-unlinked {
    cursor: default;
}
.image-lightbox {
    cursor: zoom-in;
}
.fancybox-container button {
    box-shadow: none;
}
.fancybox-container button:hover {
    background: rgba(30,30,30,.6);
}
.fancybox-container button[disabled] {
    visibility: hidden;
}
</style>
`;
        $('body').append(styles);
    }

    appendStyles();
    doPageload();

})();
