// teams  js start
var swiper = new Swiper(".youtube", {
  slidesPerView: 0,
  spaceBetween: 30,
  speed: 500,
  autoplay: true,
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
    delay: 1000,
  },
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
},
   // Responsive breakpoints
breakpoints: {
// when window width is >= 320px
320: {
  slidesPerView: 1,
  spaceBetween: 20
},
// when window width is >= 480px
480: {
  slidesPerView: 1,
  spaceBetween: 20
},
// when window width is >= 640px
540: {
  slidesPerView: 2,
  spaceBetween: 20
},
767: {
  slidesPerView: 3,
  spaceBetween: 20
},
1200: {
  slidesPerView: 4,
  spaceBetween: 20
}
}
});
// teams  js end