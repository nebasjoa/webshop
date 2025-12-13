<template>
    <div class="home-view-wrapper">
        <div class="home-view-content">
            <router-link :to="{ name: 'ArticleDetails' }">
                <div class="article-wrapper">
                    <div class="article-content">
                        <div class="article-photo">
                            <img :src="article.photo" alt="">
                        </div>
                        <div class="article-details">
                            <div class="article-title">{{ article.title }}</div>
                            <div class="article-price">{{ article.price }}</div>
                        </div>
                    </div>
                </div>
            </router-link>
        </div>
    </div>
</template>

<script>
import { useWebshopStore } from '@/stores/webshopStore.js';
import dummyPhoto from '@/assets/files/images/camera.jpg'
export default {
    data() {
        return {
            article: {
                id: '1',
                title: 'Dummy article',
                price: '€ 5,00',
                photo: dummyPhoto
            }
        }
    },
}
</script>

<style scoped>
.home-view-wrapper {
    width: 100%;
    display: flex;
}

a {
    text-decoration: none;
    color: var(--charcoal);
}

.home-view-content {
    width: 100%;
    max-width: var(--main-width);
    margin: auto;
    margin-top: 20px;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
}

.article-wrapper {
    width: 100%;
    border: 1px solid;
    border-color: var(--cool-gray);
    height: 280px;
    display: flex;
    position: relative;
}

.article-content {
    display: flex;
    width: 100%;
    flex-direction: column;
}

.article-photo img {
    width: 100%;
    overflow: hidden;
    height: 200px;
}

.article-details {
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-top: 10px;
    margin-left: 10px;
}

.article-title {
    text-overflow: ellipsis;
    overflow: hidden;
    font-size: 22px;
}

.article-price {
    font-size: 18px;
    color: var(--main-blue);
}
</style>