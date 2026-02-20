import crypto from "crypto";

export const createSaleOrder = async (
    name: string,
    orderCode: string,
    address: string,
    address2: string,
    city: string,
    state: string,
    pincode: string,
    phone: string,
    email: string,
    items: {
        variantSku: string;
        quantity: number;
        price: number;
    }[]
) => {

    try {
        const facilityCode = "wednesdayhealthindiaprivatelimited"
        const addressId = crypto.randomUUID();

        const responseToken = await fetch("https://wednesdayhealthindiaprivatelimited.unicommerce.com/oauth/token?grant_type=password&client_id=my-trusted-client&username=aditya@fitplaysolutions.com&password=Aditya@1")

        const tokenJson = await responseToken.json();

        const accessToken = tokenJson.access_token;
        const orderRes = await fetch('https://wednesdayhealthindiaprivatelimited.unicommerce.com/services/rest/v1/oms/saleOrder/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `bearer ${accessToken}`,
                'Facility': facilityCode,
            },
            body: JSON.stringify({
                "saleOrder": {
                    "cashOnDelivery": false,
                    "code": orderCode,
                    "channel": "FITPLAY_LIFE",
                    "addresses": [
                        {
                            "id": addressId,
                            "name": name || "Test User",
                            "addressLine1": address || "string",
                            "addressLine2": address2 || "string",
                            "city": city || "Ghaziabad",
                            "state": state || "Uttar Pradesh",
                            "pincode": pincode || "201206",
                            "phone": phone || "string",
                            "email": email || "string"
                        }
                    ],
                    "shippingAddress": {
                        "referenceId": addressId,
                    },
                    saleOrderItems: items.map((item: any, index: number) => ({
                        itemSku: item.variantSku,
                        shippingMethodCode: "STD",
                        code: `${orderCode}-${index + 1}`,
                        packetNumber: item.quantity,
                        giftWrap: false,
                        totalPrice: item.price * item.quantity,
                        sellingPrice: item.price,
                        prepaidAmount: item.price * item.quantity,
                        discount: 0,
                        shippingCharges: "50",
                    })),
                }
            }
            )
        });

        const orderData = await orderRes.json();

        return orderData;
    } catch (error) {
        console.error('Error creating Unicommerce order:', error);
        throw error;
    }

}