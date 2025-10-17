import Head from 'next/head'
import RootLayout from '@/components/ui/layout/RootLayout'
import BananaSportswearStorefront from '@/components/ui/demo/ProductPage'

export default function DemoPage() {
    return (
        <RootLayout>
            <Head>
                <title>PlanPro | Demo</title>
                <meta name="description" content="Demo page showcasing AI-powered product visualization" />
                <link rel="icon" href="/asset/planpro-favicon.svg" />
            </Head>
            <BananaSportswearStorefront />
        </RootLayout>
    )
}