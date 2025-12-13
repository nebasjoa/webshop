import { defineStore } from 'pinia';

export const useWebshopStore = defineStore('article', {
  state: () => ({
    article: null
  }),

  actions: {
    setArticle(article) {
      this.article = article;
    },

    clearArticle() {
      this.article = null;
    }
  },
  persist: true
});
