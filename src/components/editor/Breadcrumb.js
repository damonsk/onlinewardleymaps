import React from 'react';

const Breadcrumb = (props) => (

    <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
            <li className="breadcrumb-item">Your Map URL <a href="#" id="url">{props.currentUrl}</a><span className="btn"><a href="https://twitter.com/share?ref_src=twsrc%5Etfw"
                        className="twitter-share-button" data-via="damonsk" data-hashtags="WardleyMaps" data-related=""
                        data-show-count="false">Tweet</a>
                    <script async src="https://platform.twitter.com/widgets.js" charSet="utf-8"></script></span>
            </li>
        </ol>
    </nav>

)

export default Breadcrumb;