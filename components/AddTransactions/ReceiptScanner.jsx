import React, { useEffect, useRef } from 'react'
import { Input } from '../ui/input'
import { useFetch } from '@/hooks/useFetch';
import { Button } from '../ui/button';
import { Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { scanReceipt } from '@/actions/scanReceipt';

const ReceiptScanner = ({ onScanComplete }) => {

    const file = useRef();

    const {
        loading: receiptLoading,
        fetchData: scanReceiptFn,
        data: receiptData
    } = useFetch(scanReceipt)

    const handleReceiptScan = async (file) => {
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Receipt size should be less than 5MB")
            return
        }

        await scanReceiptFn(file);
        // onScanComplete(response);
    }

    useEffect(() => {
        if (receiptData && !receiptLoading) {
            onScanComplete(receiptData);
            toast.success('Receipt scanned successfully');
        }
    }, [receiptData, receiptLoading])

    return (
        <div>
            <Input
                type="file"
                ref={file}
                accept="image/*"
                className='hidden'
                onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        handleReceiptScan(file);
                    }
                }}
            />

            <Button
                type='button'
                className='w-full cursor-pointer'
                onClick={() => {
                    file.current.click();
                }}
                disabled={receiptLoading}
            >
                {receiptLoading ?
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>Scanning Receipt...</span>
                    </> :
                    <>
                        <Camera className="mr-2 h-4 w-4" />
                        <span>Scan Receipt with AI</span>
                    </>
                }
            </Button>
        </div>
    )
}

export default ReceiptScanner