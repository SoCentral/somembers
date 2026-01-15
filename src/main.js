// This is the main.js file. Import global CSS and scripts here.
// The Client API can be used here. Learn more: gridsome.org/docs/client-api

import DefaultLayout from "~/layouts/Default.vue";
import VueLazyload from "vue-lazyload";
import "~/assets/styles.css";

export default function(Vue, { router, head, isClient }) {
  // Set default layout as a global component
  Vue.component("Layout", DefaultLayout);
  Vue.use(VueLazyload, {
    observer: true,
    loading: "/assets/loading.svg"
  });

  head.link.push({
    rel: "preconnect",
    href: "https://ik.imagekit.io"
  });

  head.link.push({
    rel: "dns-prefetch",
    href: "https://ik.imagekit.io"
  });

  head.meta.push({
    name: "keywords",
    content:
      "SoCentral, Inkubator, Entreprenører, Incubator, Social, Societal, Members"
  });

  head.meta.push({
    name: "description",
    content:
      "Se oversikt over alle medlemmer i SoCentral sitt miljø for samfunnsinnvoasjon."
  });
}
