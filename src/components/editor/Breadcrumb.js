import React from 'react';

const Breadcrumb = () => (

    <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
            <li class="breadcrumb-item">Your Map URL <a href="#" id="url">(unsaved)</a><span class="btn"><a href="https://twitter.com/share?ref_src=twsrc%5Etfw"
                        class="twitter-share-button" data-via="damonsk" data-hashtags="WardleyMaps" data-related=""
                        data-show-count="false">Tweet</a>
                    <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script></span>
            </li>
        </ol>
    </nav>

)

export default Breadcrumb;