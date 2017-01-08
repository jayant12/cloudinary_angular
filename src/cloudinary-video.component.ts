import {
    Component,
    ElementRef,
    Input,
    ContentChildren,
    QueryList,
    AfterViewInit,
    OnInit,
    OnDestroy
} from '@angular/core';
import {Cloudinary} from './cloudinary.service';
import {CloudinaryTransformationDirective} from './cloudinary-transformation.directive';

@Component({
    selector: 'cl-video',
    template: '<video></video>'
})
// See also video reference - http://cloudinary.com/documentation/video_manipulation_and_delivery#video_transformations_reference
export class CloudinaryVideo implements AfterViewInit, OnInit, OnDestroy {

    @Input('public-id') private publicId: string;

    @ContentChildren(CloudinaryTransformationDirective)
    private transformations: QueryList<CloudinaryTransformationDirective>;

    private observer: MutationObserver;

    constructor(private el: ElementRef, private cloudinary: Cloudinary) {
    }

    ngOnInit(): void {
        // Create an observer instance
        this.observer = new MutationObserver(() => {
            this.loadVideo(this.publicId);
        });
        // Observe changes to attributes or child transformations to re-render the image
        const config = {attributes: true, childList: true};

        // pass in the target node, as well as the observer options
        this.observer.observe(this.el.nativeElement, config);
    }

    ngOnDestroy(): void {
        this.observer.disconnect();
    }

    ngAfterViewInit() {
        if (!this.publicId) {
            throw new Error('You must set the public id of the video to load, e.g. <cl-video public-id={{video.public_id}}...></cl-video>');
        }
        this.loadVideo(this.publicId);
    }

    loadVideo(publicId: string) {
        const nativeElement = this.el.nativeElement;
        const video = nativeElement.children[0];
        const options = this.cloudinary.toCloudinaryAttributes(nativeElement.attributes, this.transformations);

        const videoTag = this.cloudinary.videoTag(publicId, options);

        // Replace template with the custom video tag created by Cloudinary
        this.appendSourceElements(video, videoTag.content());
        // Add attributes
        this.setElementAttributes(video, videoTag.attributes());
    };

    setElementAttributes(element, attributesLiteral) {
        Object.keys(attributesLiteral).forEach(attrName => {
            element.setAttribute(attrName, attributesLiteral[attrName]);
        });
    }

    appendSourceElements(element, html) {
        const fragment = document.createDocumentFragment();
        element.innerHTML = html;

        while (element.childNodes[0]) {
            fragment.appendChild(element.childNodes[0]);
        }
        element.appendChild(fragment);
    }
}
