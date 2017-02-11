'use strict';
// limited global declration

(function (window, document, Rx) {
    // save the view const function
    var tplFeed = function tplFeed(feed) {
        return '<a href="' + feed.user.url + '" class="vim-author-img">\n                        <img alt="image" class="vim-feed-img  img-rounded" src="' + feed.user.image + '" width="48" height="48">\n                    </a>\n                    <div class="vim-feed-body">\n                        <div class="vim-feed-author">\n                            <a href="' + feed.user.url + '">\n                                <strong>' + feed.user.name + '</strong>\n                            </a>\n                        </div>\n                        <div class="vim-feed-video">\n                            <div class="vim-video-title">\n                                <a href="' + feed.url + '">\n                                    <h2> ' + feed.title + '</h2>\n                                </a>\n                            </div>\n                            <div class="vim-video-description">\n                               <p>\n                               ' + feed.description + '\n                                </p>\n                            </div>\n                            <div class="vim-video-footer">\n                                <span> <span class="glyphicon glyphicon-heart"></span> ' + feed.likes + ' </span>\n                                <span><span class="glyphicon glyphicon-facetime-video"></span> ' + feed.plays + '  </span>\n                                <span> <span class="glyphicon glyphicon-share-alt"></span> ' + feed.comments + ' </span>\n                            </div>\n                        </div>\n                    </div>';
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
            setObserverData(textSearch, userLike, countView, 1);
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
            // if (countView === 10) {
            //     dom.nextBtn.setAttribute('data-page-count', 0);
            //     dom.nextBtn.style.display = 'block';
            // } else {
            //     togglePaginationButton(false);
            // }

            //detach all child
            detachDom();

            setObserverData(textSearch, userLike, countView, 1);
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
            setObserverData(textSearch, userLike, countView, 1);
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

    // observer to maanipulate the next button
    function setPaginationObserver() {
        var observerPaginate = Rx.Observable.fromEvent(dom.nextBtn, 'click').map(function (e) {
            return e.target.getAttribute('data-page-count') ? e.target.getAttribute('data-page-count') : 0;
        }).filter(function (pageCount) {
            return parseInt(pageCount) !== 5;
        }).map(function (pageCount) {
            return parseInt(pageCount) + 1;
        }).debounce(300).subscribe(function (pageCount) {
            dom.nextBtn.setAttribute('data-page-count', pageCount);
            setObserverData(textSearch, userLike, countView, pageCount);
        });
    }

    // the observer data tp filter a inject to view
    function setObserverData() {
        var textSearch = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
        var userLike = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        var countView = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 10;
        var pageCount = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;

        var source = dataObservable.filter(function (feed) {
            return !userLike || !!userLike && feed.user.metadata.connections.likes.total > 10;
        }).filter(function (feed) {
            return !textSearch || !!textSearch && feed.description && feed.description.indexOf(textSearch) !== -1;
        });

        // observable to menaage the next button
        source.count().subscribe(function (count) {
            if (countView !== 10 || count <= countView * pageCount) {
                togglePaginationButton(false);
                return;
            }

            togglePaginationButton(true, pageCount);
        });

        source = source.slice(countView * pageCount - countView, countView * pageCount).map(transformData);

        source.subscribe(injectFeed);

        return source;
    }

    // disable the paginaation button
    // function resetPagination() {
    //     dom.nextBtn.setAttribute('data-page-count',0);
    //     dom.nextBtn.style.display = 'none'; 
    // }


    function togglePaginationButton(show) {
        var page = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

        dom.nextBtn.setAttribute('data-page-count', page);
        if (show) {
            dom.nextBtn.style.display = 'block';
            return;
        }

        dom.nextBtn.style.display = 'none';
    }

    // get the dom to manipulate in observer
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
        dom.container.appendChild(divFeed);;
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

    // display the default view
    function initView() {
        //detach all child
        detachDom();
        setObserverData(textSearch, userLike, countView, 1);

        if (countView === 10) {
            togglePaginationButton(true);
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

    // launch the logic
    init();
})(window, document, Rx);