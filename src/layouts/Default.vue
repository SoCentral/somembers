<script>
export default {
  metaInfo() {
    return {
      link: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "stylesheet",
          href:
            "https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@300;400;700&family=Poppins:wght@300;400;700&display=swap",
        },
      ],
    };
  },
};
</script>

<template>
  <div>
    <header class="flex justify-end items-center w-full lg:w-3/5 lg:mx-auto">
      <g-link
        to="/"
        class="w-32 md:w-40 mr-auto"
        aria-label="Gå til startsiden"
      >
        <img
          class="w-32 md:w-40"
          src="../assets/logo.png"
          alt="SoCentral logo"
        />
      </g-link>
      <div>
        <a
          class="bg-blue-700 text-white font-light py-2 px-4 rounded font-sans"
          href="https://www.socentral.no/medlem"
          aria-label="Gå til SoCentral sin side om medlemskap"
          >Bli medlem</a
        >
      </div>
    </header>
    <slot />
    <footer class="mx-auto mt-6 text-center">
      <a
        href="https://github.com/SoCentral/somembers"
        class="text-gray-700 font-light font-serif italic text-xs"
        >Source code at Github</a
      >
    </footer>
  </div>
</template>

<static-query>
query {
  metadata {
    siteName
  }
}
</static-query>

<style>
.parent {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr;
  grid-column-gap: 0px;
  grid-row-gap: 0px;
}

.animate-move {
  transition: all 0.3s ease-in-out;
}

.animate-leave-to,
.animate-enter {
  opacity: 0;
}

.animate-leave-active,
.animate-enter-active {
  transition: opacity 0.3s ease-out;
}

.animate-leave-active {
  z-index: -10;
}
</style>
