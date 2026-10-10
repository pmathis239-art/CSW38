document.addEventListener("DOMContentLoaded", function () {
const image07 = document.getElementById("cw_image07");
const image01 = document.getElementById("cw_image01");

const images = [image07, image01];

images.forEach(function (image) {
    if (image) {
        image.classList.add("spin");

        image.addEventListener("mouseenter", function () {
            image.style.animationPlayState = "paused";
        });

        image.addEventListener("mouseleave", function () {
            image.style.animationPlayState = "running";
        });
    }
});

});
