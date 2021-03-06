'use strict';
// limited global declration
(function(window, document, Rx) {
    // save the view const function
    const TPL_FEED = (feed) => {
        return `<a href="${feed.user.url}" target="_blank" class="vim-author-img" title="${feed.user.name}">
                        <img alt="${feed.user.name}" class="vim-feed-img  img-rounded" src="${feed.user.image}" width="48" height="48">
                    </a>
                    <div class="vim-feed-body">
                        <div class="vim-feed-author">
                            <a href="${feed.user.url}" target="_blank" title="${feed.user.name}">
                                <strong>${feed.user.name}</strong>
                            </a>
                        </div>
                        <div class="vim-feed-video">
                            <div class="vim-video-title">
                                <a href="${feed.url}" target="_blank" title="${feed.title}">
                                    <h2> ${feed.title}</h2>
                                </a>
                            </div>
                            <div class="vim-video-description">
                               <p>
                               ${feed.description}
                                </p>
                            </div>
                            <div class="vim-video-footer">
                                <span> <span class="glyphicon glyphicon-heart"></span> ${feed.likes} </span>
                                <span><span class="glyphicon glyphicon-facetime-video"></span> ${feed.plays}  </span>
                                <span> <span class="glyphicon glyphicon-share-alt"></span> ${feed.comments} </span>
                            </div>
                        </div>
                    </div>`
    };

    // stock the data in observaable object
    const DATA_OBSERVABLE = Rx.Observable.from(feeds.data);
    //save the dom                
    let dom = null;
    //count view
    let countView = 10;
    //seearch srting
    let textSearch = '';
    //mostUserLike
    let userLike = false;



    // the algo to listen aa execute   when user fsearch keywords
    function setSearchObserver() {
        //observer of submit form
        const observerSearch = Rx.Observable.fromEvent(dom.form, 'submit')
            .do((e) => {
                e.preventDefault();
            })
            .map((e) => {
                return e.target.getElementsByTagName('input')[0].value
            })
            .filter((text) => {
                return !!text.length
            })
            .debounce(300);

        //observable of submit form
        observerSearch.subscribe(function(_textSearch) {
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
        const observerSearch = Rx.Observable.fromEvent(dom.selectCountFeed, 'change')
            .map((e) => {
                return e.target.value
            })
            .debounce(300);

        observerSearch.subscribe((_countView) => {
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
        const observerUserLike = Rx.Observable.fromEvent(dom.cheboxUserLikes, 'change')
            .partition((e) => {
                return e.target.checked === true
            });

        //portion if the checkbox is checked
        observerUserLike[0].subscribe((checked) => {
            //detach all child
            detachDom();
            userLike = true;
            textSearch = '';
            setObserverData(textSearch, userLike, countView, 1);
        });

        //portion if the checkbox is unchecked
        observerUserLike[1].subscribe(() => {
            userLike = false;
            textSearch = '';
            //detach all child
            detachDom();
            initView();
        })
    }


    // observer to maanipulate the next button
    function setPaginationObserver() {
        const observerPaginate = Rx.Observable.fromEvent(dom.nextBtn, 'click')
            .map((e) => {
                return e.target.getAttribute('data-page-count') ? e.target.getAttribute('data-page-count') : 0;
            })
            .filter((pageCount) => {
                return parseInt(pageCount) !== 5;
            })
            .map((pageCount) => {
                return parseInt(pageCount) + 1;
            })
            .debounce(300)
            .subscribe((pageCount) => {
                dom.nextBtn.setAttribute('data-page-count', pageCount);
                setObserverData(textSearch, userLike, countView, pageCount);
            })
    }


    // the observer data tp filter a inject to view
    function setObserverData(textSearch = '', userLike = false, countView = 10, pageCount = 1) {
        let source = DATA_OBSERVABLE
            .filter((feed) => {
                return !userLike || (!!userLike && feed.user.metadata.connections.likes.total > 10);
            })
            .filter((feed) => {
                return !textSearch || (!!textSearch && feed.description && feed.description.indexOf(textSearch) !== -1);
            });



        // observable to menaage the next button
        source.count()
            .subscribe((count) => {
                if (countView !== 10 || count <= (countView * pageCount)) {
                    togglePaginationButton(false);
                    return;
                }

                togglePaginationButton(true, pageCount);
            });

        source = source
            .slice((countView * pageCount) - countView, countView * pageCount)
            .map(transformData);

        source.subscribe(injectFeed);


        return source
    }


    // disable the paginaation button
    // function resetPagination() {
    //     dom.nextBtn.setAttribute('data-page-count',0);
    //     dom.nextBtn.style.display = 'none'; 
    // }


    function togglePaginationButton(show, page = 1) {
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
        let divFeed = document.createElement('div');
        divFeed.className = 'vim-feed';
        divFeed.innerHTML = TPL_FEED(feed);
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
        let image = feed.user.pictures && feed.user.pictures.sizes && feed.user.pictures.sizes.length === 4 ? feed.user.pictures.sizes[3].link : '';
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
                image
            }
        }
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