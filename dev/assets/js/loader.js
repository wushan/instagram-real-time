(function() {
    var socket = io.connect('http://middlemiddle.com');

    /**
     * [Namespacing]
     */
    var Insta = Insta || {};
    
    Insta.App = {

        /**
         * [Application initialization method / call for the methods being initializated in order]
         */
        init: function() {
            this.mostRecent();
            this.getData();//
        },

    

        /**
         * [get data ajax and send to render method]
         */
        getData: function() {
            var self = this;
            socket.on('show', function(data) {
                var url = data.show;
                $.ajax({
                    url: url,
                    type: 'POST',
                    crossDomain: true,
                    dataType: 'jsonp'
                }).done(function (data) {
                    self.renderTemplate(data);
                });
            });
        },

        /**
         * [Render the images on the page and check for layout resize]
         */
        renderTemplate: function(data) {
            //Got to Remove old image and then add new
            var query = data;
            var instaPicture = query.data[0].images.standard_resolution.url;
            var AspectW = query.data[0].images.standard_resolution.width;
            var AspectH = query.data[0].images.standard_resolution.height;
            var AspectR = AspectW/AspectH;
            var instaTag = query.data[0].tags;
            var instaTime = query.data[0].created_time;
            var instaAnchor = query.data[0].link;
            var instaHTML;
            if (AspectR > 1) {
                instaHTML = "<div class='block wide'><a href='" + instaAnchor + "'><img src='" + instaPicture + "'/></a><div class='instainfos'><p>Posted:" + instaTime + "</p></div></div>";
            } else {
                instaHTML = "<div class='block'><a href='" + instaAnchor + "'><img src='" + instaPicture + "'/></a><div class='instainfos'><p>Posted:" + instaTime + "</p></div></div>";
            }
            // INSERT THE GALLERY
            $('#list').prepend(instaHTML);
        },

        /**
         * [ render most recent pics defined by subscribed hashtag ]
         */
        mostRecent: function() {
            socket.on('firstShow', function (data) {
                var query = data;
                console.log(query);
                console.log(query.firstShow.length);
                for (var i = 0; i < query.firstShow.length && i < 25; i++) {
                    // GET THE PICTURE
                    var instaPicture = query.firstShow[i].images.standard_resolution.url;
                    var AspectW = query.firstShow[i].images.standard_resolution.width;
                    var AspectH = query.firstShow[i].images.standard_resolution.height;
                    var AspectR = AspectW/AspectH;
                    var instaTag = query.firstShow[i].tags;
                    var instaTime = query.firstShow[i].created_time;
                    var instaAnchor = query.firstShow[i].link;
                    var instaHTML;
                    if (AspectR > 1) {
                        instaHTML = "<div class='block wide'><a href='" + instaAnchor + "'><img src='" + instaPicture + "'/></a><div class='instainfos'><p>Posted:" + instaTime + "</p></div></div>";
                    } else {
                        instaHTML = "<div class='block'><a href='" + instaAnchor + "'><img src='" + instaPicture + "'/></a><div class='instainfos'><p>Posted:" + instaTime + "</p></div></div>";
                    };
                    // INSERT THE GALLERY
                    $('#list').prepend(instaHTML);
                    // console.log(instaHTML);
                };
            });
        },

        

    };

    Insta.App.init();

})(this);