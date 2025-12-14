<template>
    <div class="checkout-wrapper">
        <div class="checkout-content">
            <div class="webshop-name">Summary</div>
            <div class="separator">
                <hr>
            </div>
            <div class="mid-section">
                <div class="order-details">
                    <div class="shipping-address">
                        <p>Shipping Address</p>
                        <p>Strasse 1, 10000 City</p>
                    </div>
                    <div class="billing-address">
                        <p>Shipping Address</p>
                        <p>Strasse 1, 10000 City</p>
                    </div>
                    <div class="payment-method">
                        <p>Payment method</p>
                        <div class="payment-method-subgroup">
                            <input type="radio" id="pm-card" name="paymentmethod" value="card" v-model="paymentmethod">
                            <label for="pm-card">Card (redirect to Computop HPP)</label>
                        </div>
                        <div class="payment-method-subgroup">
                            <input type="radio" id="pm-paypal" name="paymentmethod" value="paypal"
                                v-model="paymentmethod">
                            <label for="pm-paypal">PayPal (direct integration: paypal.aspx)</label>
                        </div>
                    </div>
                    <div class="checkout-article">
                        <div class="checkout-article-photo">
                            <img :src="store.article.photo" alt="">
                        </div>
                        <div>
                            <div>{{ store.article.title }}</div>
                            <div>{{ store.article.price }}</div>
                        </div>
                    </div>
                </div>
                <form class="debug-wrapper" @submit.prevent="startPayment">
                    <div class="order-summary">
                        <div class="summary-header">Order summary</div>
                        <div class="order-summary-bottom-wrapper">
                            <div class="total-amount"><span>Total amount: </span><span>{{ store.article.price }}</span>
                            </div>
                            <div><button class="buy-button" type="submit">BUY NOW</button></div>
                        </div>
                    </div>
                    <div class="debug">
                        <h3>KVP parameters</h3>
                        <div class="debug-subgroup">
                            <label class="simple-label" for="merchantId">Merchant ID:</label>
                            <input id="merchantId" name="MerchantID" type="text" value="npesic_test">
                        </div>
                        <div class="debug-subgroup">
                            <label class="simple-label" for="">Blowfish password:</label>
                            <input type="text" v-model="blowfishpw">
                        </div>
                        <div class="debug-subgroup">
                            <label class="simple-label" for="">HMAC password:</label>
                            <input type="text">
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
import { useWebshopStore } from '@/stores/webshopStore.js';
import dummyPhoto from '@/assets/files/images/camera.jpg'
import axios from 'axios';
export default {
    data() {
        return {
            store: useWebshopStore(),
            blowfishpw: 'AaAaAaAaAaAaAaAa',
            article: {
                id: '1',
                title: 'Dummy article',
                price: '500',
                photo: dummyPhoto
            },
            paymentmethod: null,
            url: 'https://test.computop-paygate.com',
            aspxpage: 'paymentpage.aspx',
            currency: 'EUR',
            msgver: '2.0',
        }
    },
    methods: {
        async startPayment() {
            try {
                const res = await axios.post('/pay', {
                    amount: this.article.price,
                    currency: this.article.currency,
                    msgver: '2.0',
                    refNr: this.generateTransId(),
                    transid: this.generateTransId(),
                }, {
                    responseType: 'text' // IMPORTANT
                });

                // Replace current document with returned HTML
                window.location.assign(res.data.redirectUrl);

            } catch (err) {
                console.error('Payment start failed', err);
            }
        },
        generateTransId() {
            const time = Date.now().toString().slice(-8);
            const rand = Math.floor(Math.random() * 1e4).toString().padStart(4, '0');
            return time + rand;
        }
    }
}
</script>

<style scoped>
.checkout-wrapper {
    width: 100%;
    display: flex;
}

.checkout-content {
    width: 100%;
    max-width: var(--main-width);
    margin: auto;
    margin-top: 20px;
    display: flex;
    flex-direction: column;
}

.webshop-name {
    width: 100%;
    display: flex;
    text-align: center;
    margin: 30px 0;
    justify-content: center;
    font-size: 20px;
}

.separator {
    opacity: .4;
}

.mid-section {
    display: grid;
    grid-template-columns: 2fr 1fr;
    column-gap: 20px;
}

.order-details {
    display: flex;
    flex-direction: column;
}

.shipping-address {
    width: 100%;
    margin-top: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid;
    border-color: var(--main-shadow);
}

.billing-address {
    width: 100%;
    margin-top: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid;
    border-color: var(--main-shadow);
}

.payment-method {
    width: 100%;
    margin-top: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid;
    border-color: var(--main-shadow);
}

.payment-method-subgroup {
    display: flex;
    gap: 5px;
    margin-top: 10px;
}

.debug-wrapper {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.debug {
    width: 100%;
}

.debug-subgroup {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 3px;
}

.simple-label {
    font-size: 12px;
    width: 50%;
    text-align: right;
}

.checkout-article {
    margin: 20px 0;
    display: grid;
    grid-template-columns: 1fr 3fr;
    column-gap: 10px;
    border: 1px solid;
    border-color: var(--charcoal);
}

.checkout-article-photo {
    padding: 0;
    margin: 0;
    display: flex;
    width: 100%;
}

.checkout-article-photo img {
    height: 130px;
    overflow: hidden;
}

.order-summary {
    width: 100%;
    height: 300px;
    background-color: var(--main-background);
    padding: 20px;
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.summary-header {
    text-align: center;
    margin-bottom: 20px;
    font-size: 20px;
}

.buy-button {
    width: 100%;
    padding: 10px 15px;
    background-color: var(--charcoal);
    color: white;
    font-size: 16px;
    cursor: pointer;
    border: none;
    display: flex;
    justify-content: center;
}

.order-summary-bottom-wrapper {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.total-amount {
    font-size: 20px;
}
</style>