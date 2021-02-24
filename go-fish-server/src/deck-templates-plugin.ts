import {Server, ServerOptions} from "@hapi/hapi";

const kodiakDeckTemplate = [
    { value: "saqul'aaq", image: "https://drive.google.com/uc?id=1N8FWetDVpGq7SyMZnkeq0Rs_AnkZSxxu" },
    { value: "kaaRaq", image: "https://drive.google.com/uc?id=1X_1l6jVdYExDwcJ4hK06INB6MfkQT3AG" },
    { value: "paRag'autaq (N) / paRag'uutaq (S)", image: "https://drive.google.com/uc?id=1zYn03jp_3JemEy44Iryw9XXwnHWDUZS4" },
    { value: "wiil'kaaq (N) / wiiR'kaaq (S)", image: "https://drive.google.com/uc?id=1LwoyYDRYSSC7ylONv_DJKvM9kHWd1y3s" },
    { value: "kalikaq", image: "https://drive.google.com/uc?id=1b1KMLAuS9dwNv_mlfDRppAqOVtduhFGq" },
    { value: "kaRtuugaaq", image: "https://drive.google.com/uc?id=11PS0Ux_RpidiwxQjZvRTJ8Z7BeFeu_eT" },
    { value: "kluucaq", image: "https://drive.google.com/uc?id=17Yq4B7rl0Oyy90gzF70xeJvurEm3Rt1l" },
    { value: "yaamaq", image: "https://drive.google.com/uc?id=1cwjbp3VGRCFMBbkadwR4BqqhyijpOTNn" },
    { value: "qatayaq", image: "https://drive.google.com/uc?id=1dEFxnIFrAPTeqSrk-swhGr4tyM5Oqd2h" },
    { value: "laus'kaaq (N) / luus'kaaq (S)", image: "https://drive.google.com/uc?id=1UKlqb75pYWRIHIFtmWm0xDGsCn-YHCTJ  " },
    { value: "taquka'aq", image: "https://drive.google.com/uc?id=1grf1RjprlpkkwgHJNrBRd3ntdzHtbytG" },
    { value: "yaaplakaaq", image: "https://drive.google.com/uc?id=1vIx334SjSFDsm0JT0aIjoJo8sE8pyr7p" },
    { value: "wiinaq", image: "https://drive.google.com/uc?id=1rMfTMxMGfB2WiQMc7NaeBqgPsxCQcsfz" },
    { value: "caskaq", image: "https://drive.google.com/uc?id=1poY_6S4x1sJbj1oMP5teiDFQLlqJ83t-" },
];

const qawalangimTunuuDeckTemplate = [
    { value: "yaablukaX", image: "https://drive.google.com/uc?id=1Urnd6hmYmhClVrmiLrQgQXl50P9-dgiq" },
    { value: "yaachiX", image: "https://drive.google.com/uc?id=1fO7WLTpuZfE6QbcQ3JXp-2vIqRHQ1BgZ" },
    { value: "chaaskaX", image: "https://drive.google.com/uc?id=1omBLfjxii-lGP9YlvwzWWkywZBbdZ6Y3" },
    { value: "duularaX", image: "https://drive.google.com/uc?id=1W4AF4kdm3sTRh6u866kPAVyZbLumPygY" },
    { value: "laaqudaX", image: "https://drive.google.com/uc?id=100dYiKXe7h2mulMgT3wRypAaXA5GNzr8" },
    { value: "isuX", image: "https://drive.google.com/uc?id=13dXX78-s0ONZWeRm6YKcuna06M6jTpg6" },
    { value: "chagiX", image: "https://drive.google.com/uc?id=1Yv_WO-vofoPmVxXCzeaz9X4PAHhTjRVD" },
    { value: "saliguX", image: "https://drive.google.com/uc?id=1A30saS6PUg4nM62YcxRPcNda2zGTNJXT" },
    { value: "nuusiX", image: "https://drive.google.com/uc?id=1ABGZpiQlwmeRUu4DWnSJVQx4SqeyhXqY" },
    { value: "qungaayuX", image: "https://drive.google.com/uc?id=1yKGOKFafoOXTih3ZAPrJozxLkwNLuv8h" },
    { value: "kartuufilaX", image: "https://drive.google.com/uc?id=1xxWFaBw66TxvAg72LgMXHQwTwzXjnES6" },
    { value: "nuugiX", image: "https://drive.google.com/uc?id=12YuP1KrGJiQtuDeyAOgV4htZ6v6Ivkgz" },
    { value: "stuuluX", image: "https://drive.google.com/uc?id=1CfQtpVaBDylfvE-tNloGhr2BHC90SklV" },
]

export const DeckTemplatesPlugin = {
    name: "go-fish-deck-templates",
    register: async function (server: Server, options: ServerOptions) {
        server.route({
            method: 'GET',
            path: '/templates',
            handler: (request, h) => {
                return [
                    {
                        name: "Alutiiq",
                        template: kodiakDeckTemplate
                    }, {
                        name: "Qawalangim Tunuu",
                        template: qawalangimTunuuDeckTemplate
                    }
                ]
            }
        })
    }
}