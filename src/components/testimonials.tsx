
"use client";

import { useState, useEffect, useContext } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { ReviewContext, Review } from "@/contexts/review-context";

export function Testimonials() {
    const [landingReviews, setLandingReviews] = useState<Review[]>([]);
    const reviewContext = useContext(ReviewContext);

    useEffect(() => {
        if(reviewContext) {
            const fetchReviews = async () => {
                const reviews = await reviewContext.getReviewsForLanding();
                setLandingReviews(reviews);
            }
            fetchReviews();
        }
    }, [reviewContext]);

  return (
    <section id="testimonials" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-headline font-bold text-center mb-12">
          What People Say
        </h2>
        
        {landingReviews.length > 0 ? (
            <Carousel
            opts={{
                align: "start",
                loop: landingReviews.length > 1,
            }}
            className="w-full max-w-4xl mx-auto"
            >
            <CarouselContent>
                {landingReviews.map((testimonial) => (
                <CarouselItem key={testimonial.id} className="md:basis-1/2">
                    <div className="p-1 h-full">
                    <Card className="flex flex-col h-full shadow-lg hover:shadow-2xl transition-shadow duration-300">
                        <CardContent className="flex flex-col flex-grow items-center justify-center text-center p-6">
                        <div className="flex mb-4">
                            {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                            ))}
                        </div>
                        <p className="text-muted-foreground italic mb-6 flex-grow">
                            "{testimonial.quote}"
                        </p>
                        <Avatar className="mb-4 h-16 w-16">
                            <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                            <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <p className="font-bold">{testimonial.name}</p>
                        </CardContent>
                    </Card>
                    </div>
                </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
            </Carousel>
        ) : (
            <div className="text-center text-muted-foreground">
                <p>No reviews yet. Be the first to leave one!</p>
            </div>
        )}
      </div>
    </section>
  );
}
