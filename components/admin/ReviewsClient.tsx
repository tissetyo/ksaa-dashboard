'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Star, Trash2 } from 'lucide-react';
import { toggleReviewApproval, deleteReview } from '@/lib/actions/admin-review';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ReviewsClientProps {
    reviews: any[];
}

export function ReviewsClient({ reviews }: ReviewsClientProps) {
    const [reviewList, setReviewList] = useState(reviews);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const handleToggleApproval = async (id: string, currentStatus: boolean) => {
        try {
            // Optimistic update
            setReviewList(prev => prev.map(r =>
                r.id === id ? { ...r, isApproved: !currentStatus } : r
            ));

            await toggleReviewApproval(id, !currentStatus);
            toast.success(`Review ${!currentStatus ? 'approved' : 'hidden'}`);
        } catch (error) {
            toast.error('Failed to update status');
            // Revert
            setReviewList(prev => prev.map(r =>
                r.id === id ? { ...r, isApproved: currentStatus } : r
            ));
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;

        try {
            await deleteReview(deleteId);
            setReviewList(prev => prev.filter(r => r.id !== deleteId));
            toast.success('Review deleted');
        } catch (error) {
            toast.error('Failed to delete review');
        } finally {
            setDeleteId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Review Management</h1>
                <Badge variant="outline" className="text-base px-3 py-1">
                    Total: {reviewList.length}
                </Badge>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Reviewer</TableHead>
                            <TableHead>Service / Staff</TableHead>
                            <TableHead>Rating</TableHead>
                            <TableHead className="w-[300px]">Comment</TableHead>
                            <TableHead>Approved</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reviewList.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                                    No reviews yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            reviewList.map((review) => (
                                <TableRow key={review.id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm">
                                                {format(new Date(review.createdAt), 'dd MMM yyyy')}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {format(new Date(review.createdAt), 'HH:mm')}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm">{review.reviewerName || 'Anonymous'}</span>
                                            <span className="text-xs text-gray-400">{review.patient?.phone || ''}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm">{review.product?.name}</span>
                                            <span className="text-xs text-muted-foreground">
                                                w/ {review.staff?.fullName || 'Unknown'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center text-yellow-500">
                                            <span className="font-bold mr-1">{review.rating}</span>
                                            <Star className="w-4 h-4 fill-current" />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <p className="text-sm line-clamp-3 leading-relaxed">
                                            {review.comment}
                                        </p>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                checked={review.isApproved}
                                                onCheckedChange={() => handleToggleApproval(review.id, review.isApproved)}
                                            />
                                            <span className="text-xs text-muted-foreground">
                                                {review.isApproved ? 'Public' : 'Hidden'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => setDeleteId(review.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This review will be permanently deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
