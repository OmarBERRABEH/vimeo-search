'use strict';
// limited global declration

(function (window, document, Rx) {
    // save 
    var tplFeed = function tplFeed(feed) {
        return '<a href="' + feed.user.url + '" class="vim-author-img">\n\t\t\t\t\t                        <img alt="image" class="vim-feed-img  img-rounded" src="' + feed.user.image + '" width="48" height="48">\n\t\t\t\t\t                    </a>\n\t\t\t\t\t                    <div class="vim-feed-body">\n\t\t\t\t\t                        <div class="vim-feed-author">\n\t\t\t\t\t                            <a href="' + feed.user.url + '">\n\t\t\t\t\t                                <strong>' + feed.user.name + '</strong>\n\t\t\t\t\t                            </a>\n\t\t\t\t\t                        </div>\n\n\t\t\t\t\t                        <div class="vim-feed-video">\n\t\t\t\t\t                            <div class="vim-video-title">\n\t\t\t\t\t                                <a href="' + feed.url + '">\n\t\t\t\t\t                                    <h2> ' + feed.title + '</h2>\n\t\t\t\t\t                                </a>\n\t\t\t\t\t                            </div>\n\t\t\t\t\t                            <div class="vim-video-description">\n\t\t\t\t\t                               <p>\n\t\t\t\t\t                               ' + feed.description + '\n\t\t\t\t\t                                </p>\n\t\t\t\t\t                            </div>\n\t\t\t\t\t                            <div class="vim-video-footer">\n\t\t\t\t\t                                <span> <span class="glyphicon glyphicon-heart"></span> ' + feed.likes + ' </span>\n\t\t\t\t\t                                <span><span class="glyphicon glyphicon-facetime-video"></span> ' + feed.plays + '  </span>\n\t\t\t\t\t                                <span> <span class="glyphicon glyphicon-share-alt"></span> ' + feed.comments + ' </span>\n\t\t\t\t\t                            </div>\n\t\t\t\t\t                        </div>\n\t\t\t\t\t                    </div>';
    };

    // stock the data in observaable object
    var dataObservable = Rx.Observable.from(feeds.data);
    //save the dom                
    var dom = null;
    //count view
    var countView = 10;
    //seearch srting
    var textSearch = '';
    //mostUserLike
    var userLike = false;

    // the algo to listen aa execute   when user fsearch keywords
    function setSearchObserver() {
        //observer of submit form
        var observerSearch = Rx.Observable.fromEvent(dom.form, 'submit').do(function (e) {
            e.preventDefault();
        }).map(function (e) {
            return e.target.getElementsByTagName('input')[0].value;
        }).filter(function (text) {
            return !!text.length;
        }).debounce(300);

        //observable of submit form
        observerSearch.subscribe(function (_textSearch) {
            textSearch = _textSearch;
            userLike = false;
            //detach all child
            detachDom();
            setObserverData(textSearch, userLike, countView, 1).subscribe(resetPagination);
        });
    }

    // function to delegaate  listen on chaange select count view
    function setObserverCountFeedview() {
        //observer of change select
        var observerSearch = Rx.Observable.fromEvent(dom.selectCountFeed, 'change').map(function (e) {
            return e.target.value;
        }).debounce(300);

        observerSearch.subscribe(function (_countView) {
            countView = parseInt(_countView);
            if (countView === 10) {
                dom.nextBtn.setAttribute('data-page-count', 0);
                dom.nextBtn.style.display = 'block';
            } else {
                resetPagination();
            }

            //detach all child
            detachDom();

            var sourceData = Rx.Observable.from(feeds.data).filter(function (feed) {
                return !!textSearch || feed.description && feed.description.indexOf(textSearch) !== -1;
            }).filter(function (feed) {
                return !userLike || feed.user.metadata.connections.likes.total > 10;
            }).map(transformData).slice(0, countView).subscribe(injectFeed);
        });
    }

    // observer to lmisten aand menaage the data of user have  likes more than 10
    function setObserverVideoUserMoreLike() {
        var observerUserLike = Rx.Observable.fromEvent(dom.cheboxUserLikes, 'change').partition(function (e) {
            return e.target.checked === true;
        });

        //portion if the checkbox is checked
        observerUserLike[0].subscribe(function (checked) {
            //detach all child
            detachDom();
            userLike = true;
            textSearch = '';
            setObserverData(textSearch, userLike, countView, 1).subscribe(resetPagination);
        });

        //portion if the checkbox is unchecked
        observerUserLike[1].subscribe(function () {
            userLike = false;
            textSearch = '';
            //detach all child
            detachDom();
            initView();
        });
    }

    function setPaginationObserver() {
        var observerPaginate = Rx.Observable.fromEvent(dom.nextBtn, 'click').map(function (e) {
            return e.target.getAttribute('data-page-count') ? e.target.getAttribute('data-page-count') : 0;
        }).filter(function (pageCount) {
            return parseInt(pageCount) !== 50;
        }).map(function (pageCount) {
            return parseInt(pageCount) + 10;
        }).debounce(300).subscribe(function (pageCount) {

            if (pageCount === 50) {
                resetPagination();
            }
            dom.nextBtn.setAttribute('data-page-count', pageCount);
            setObserverData(textSearch, userLike, pageCount);
        });
    }

    // disable the paginaation button
    function resetPagination() {
        dom.nextBtn.setAttribute('data-page-count', 0);
        dom.nextBtn.style.display = 'none';
    }

    function initDom() {
        dom = {
            container: document.getElementById('vim-feed-container'),
            form: document.getElementById('vim-search'),
            cheboxUserLikes: document.getElementById('usermorelikes'),
            selectCountFeed: document.getElementById('selectCountfeed'),
            nextBtn: document.getElementById('vim-next-btn')
        };
    }

    //function to  inject  a node into container
    function injectFeed(feed) {
        var divFeed = document.createElement('div');
        divFeed.className = 'vim-feed';
        divFeed.innerHTML = tplFeed(feed);
        dom.container.appendChild(divFeed);
        ;
    }

    // function to detache aall; child of container
    function detachDom() {
        while (dom.container.firstChild) {
            dom.container.removeChild(dom.container.firstChild);
        }
    }

    // function to transfrom a complex data(feed) to simple data(feed) for more visibility
    function transformData(feed) {
        var image = feed.user.pictures && feed.user.pictures.sizes && feed.user.pictures.sizes.length === 4 ? feed.user.pictures.sizes[3].link : '';
        return {
            title: feed.name,
            description: feed.description,
            url: feed.link,
            plays: feed.stats.plays,
            likes: feed.metadata.connections.likes.total,
            comments: feed.metadata.connections.comments.total,
            user: {
                url: feed.user.link,
                name: feed.user.name,
                likes: feed.user.metadata.connections.likes.total,
                image: image
            }
        };
    }

    function setObserverData() {
        var textSearch = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
        var userLike = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        var countView = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 10;

        var source = dataObservable.filter(function (feed) {
            return !userLike || !!userLike && feed.user.metadata.connections.likes.total > 10;
        }).filter(function (feed) {
            return !textSearch || !!textSearch && feed.description && feed.description.indexOf(textSearch) !== -1;
        }).slice(countView - 10, countView).map(transformData);

        source.subscribe(injectFeed);

        return source;
    }

    // display the default view
    function initView() {
        //detach all child
        detachDom();

        setObserverData(textSearch, userLike, countView, 1);

        if (countView === 10) {
            dom.nextBtn.setAttribute('data-page-count', 10);
            dom.nextBtn.style.display = 'block';
        }
    }

    // launch all observer
    function initObserver() {
        setSearchObserver();
        setObserverVideoUserMoreLike();
        setObserverCountFeedview();
        setPaginationObserver();
    }

    // the first  function to laaunch when  js is loaded
    // no need to document ready becuse the js aapp is injected in bottom
    function init() {
        initDom();
        initObserver();
        initView();
    }

    init();
})(window, document, Rx);