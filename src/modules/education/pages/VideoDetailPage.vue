<template>
  <div class="video-detail-page">
    <h2>{{ videoData.title }}</h2>
    <div class="video-thumbnail" @click="showOverlay = true">
      <img :src="`https://img.youtube.com/vi/${videoId}/0.jpg`" alt="video thumbnail" />
    </div>
    <p>{{ videoData.description }}</p>

    <div v-if="showOverlay" class="video-overlay">
      <div class="overlay-content">
        <button class="close-button" @click="showOverlay = false">✕</button>
        <iframe :src="videoData.embedUrl" frameborder="0" allowfullscreen />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["videoId"],
  data() {
    return {
      videoData: {},
      showOverlay: false,
    };
  },
  mounted() {
    this.fetchVideoDetail();
  },
  methods: {
    fetchVideoDetail() {
      this.videoData = {
        title: "풀영상 제목",
        embedUrl: `https://www.youtube.com/embed/${this.videoId}`,
        description: "영상 설명입니다.",
      };
    },
  },
};
</script>

<style scoped>
.video-detail-page {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.video-thumbnail img {
  cursor: pointer;
  width: 100%;
  max-width: 100%;
  border-radius: 8px;
}

.video-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.overlay-content {
  position: relative;
  width: 90%;
  max-width: 960px;
}

.overlay-content iframe {
  width: 100%;
  height: 540px;
}

.close-button {
  position: absolute;
  top: -40px;
  right: 0;
  font-size: 2rem;
  color: white;
  background: none;
  border: none;
  cursor: pointer;
}
</style>
