import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from "date-fns";
import { Clock, RefreshCw } from "lucide-react";

const RecurringBadge = ({ isRecurring, recurringInterval, nextRecurringDate }) => (
    isRecurring ? (
        <Tooltip>
            <TooltipTrigger>
                <Badge variant='outline' className='gap-1 bg-purple-100 text-purple-700 hover:bg-purple-200'>
                    <RefreshCw className='h-3 w-3' />
                    {recurringInterval}
                </Badge>
            </TooltipTrigger>
            <TooltipContent>
                <div className='text-sm'>
                    <div className='font-medium'>Next Date:</div>
                    <div>{format(new Date(nextRecurringDate), 'PP')}</div>
                </div>
            </TooltipContent>
        </Tooltip>
    ) : (
        <Badge variant='outline' className='gap-1'>
            <Clock className='h-3 w-3' />
            One-time
        </Badge>
    )
);

export default RecurringBadge;