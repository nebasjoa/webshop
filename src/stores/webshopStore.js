import { defineStore } from 'pinia';
import dummyPhoto from '@/assets/files/images/camera.jpg'

export const useWebshopStore = defineStore('article', {
    state: () => ({
        article: {
            id: '1',
            title: 'Dummy article',
            price: '€ 5,00',
            photo: dummyPhoto
        },
        isMiniCart: false,
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
