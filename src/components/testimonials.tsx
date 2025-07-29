"use client";

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

const testimonials = [
  {
    quote: "The best turf in the city! The pitch is always in perfect condition, and the floodlights are amazing for night games. My team and I love playing here.",
    name: "Kwame Appiah",
    title: "Sunday League Captain",
    avatar: "https://placehold.co/100x100.png",
  },
  {
    quote: "Booking was a breeze, and the staff were incredibly helpful. The amenities, especially the changing rooms, are top-notch. Highly recommended for any football enthusiast.",
    name: "Adwoa Mensah",
    title: "Corporate Event Organizer",
    avatar: "https://placehold.co/100x100.png",
  },
  {
    quote: "We hosted our son's birthday party here and it was a huge hit. The kids had a fantastic time on the safe, high-quality turf. It's a great community asset.",
    name: "Femi Adebayo",
    title: "Parent",
    avatar: "https://placehold.co/100x100.png",
  },
   {
    quote: "As a professional coach, I appreciate the quality of this facility. It's perfect for training sessions. The surface is consistent and reduces the risk of injury.",
    name: "Coach Ibrahim",
    title: "Youth Football Coach",
    avatar: "https://placehold.co/100x100.png",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-headline font-bold text-center mb-12">
          What Our Players Say
        </h2>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full max-w-4xl mx-auto"
        >
          <CarouselContent>
            {testimonials.map((testimonial, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1 h-full">
                  <Card className="flex flex-col h-full shadow-lg hover:shadow-2xl transition-shadow duration-300">
                    <CardContent className="flex flex-col flex-grow items-center justify-center text-center p-6">
                      <div className="flex mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
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
                      <p className="text-sm text-muted-foreground">
                        {testimonial.title}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
}
