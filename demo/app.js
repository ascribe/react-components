import 'bootstrap-loader';
import 'babel-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';

import { Button, ButtonContainer } from '../modules/buttons';

import { FileDragAndDropInput, ReactS3FineUploader, UploadButton } from '../modules/uploader';


//TODO: turn this into a nicely formatted styleguide
const App = React.createClass({
    render() {
        const dummyUploaderProps = {
            objectProperties: {
                bucket: 'dummy_bucket'
            },
            signature: {
                endpoint: 's3/signature/'
            }
        };

        const FileDragAndDrop = (
            <FileDragAndDropInput
                handleSubmitFile={() => {
                    /* Just to avoid the .isRequired error.
                     *
                     * Actual usage of this component would probably involve it being wrapped by
                     * another component with the props getting passed down during the render.
                     *
                     * This is only a problem here because we're directly instantiating the
                     * class to add child UI elements.
                     */
                }}>
                <div style={{'width': 100, 'height': 100, 'backgroundColor': 'red'}} />
            </FileDragAndDropInput>
        );

        return (
            <div>
                <marquee direction="right">
                    Well, this could certainly be made better, ideally we'd have an auto-generated styleguide or something... but for now you can enjoy this
                </marquee>
                <h2>Buttons</h2>
                <h3>Primary Button</h3>
                <div>
                    <Button>Primary</Button>
                    <Button className="active focus">Primary Active</Button>
                    <Button disabled>Primary Disabled</Button>
                    <Button size="xs">Primary XS</Button>
                    <Button size="sm">Primary SM</Button>
                    <Button size="lg">Primary LG</Button>
                    <div>
                        <Button wide>Primary Wide</Button>
                    </div>
                </div>
                <h3>Secondary Button</h3>
                <div>
                    <Button classType="secondary">Secondary</Button>
                    <Button classType="secondary" className="active focus">Secondary Active</Button>
                    <Button classType="secondary" disabled>Secondary Disabled</Button>
                    <Button classType="secondary" size="xs">Secondary XS</Button>
                    <Button classType="secondary" size="sm">Secondary SM</Button>
                    <Button classType="secondary" size="lg">Secondary LG</Button>
                    <div>
                        <Button classType="secondary" wide>Secondary Wide</Button>
                    </div>
                </div>
                <h3>Tertiary Button</h3>
                <div>
                    <Button classType="tertiary">Tertiary</Button>
                    <Button classType="tertiary" className="active focus">Tertiary Active</Button>
                    <Button classType="tertiary" disabled>Tertiary Disabled</Button>
                    <Button classType="tertiary" size="xs">Tertiary XS</Button>
                    <Button classType="tertiary" size="sm">Tertiary SM</Button>
                    <Button classType="tertiary" size="lg">Tertiary LG</Button>
                    <div>
                        <Button classType="tertiary" wide>Tertiary Wide</Button>
                    </div>
                </div>
                <h3>Button Container</h3>
                <div>
                    <ButtonContainer>
                        <button>A button</button>
                    </ButtonContainer>
                </div>
                <div>
                    <ButtonContainer label="Container label">
                        <button>A button with label</button>
                    </ButtonContainer>
                </div>
                <h2>Uploader</h2>
                <h3>Upload button</h3>
                <div>
                    <ReactS3FineUploader {...dummyUploaderProps} />
                </div>
                <div>
                    <ReactS3FineUploader
                        {...dummyUploaderProps}
                        fileInputElement={UploadButton({
                            buttonElement: (<Button classType="secondary" />),
                            getLabel: () => null
                        })} />
                </div>
                <h3>Drag and drop</h3>
                <div>
                    <ReactS3FineUploader
                        {...dummyUploaderProps}
                        fileInputElement={FileDragAndDrop} />
                </div>
            </div>
        );
    }
});

// TODO: use ReactDOM when upgrading to React 1.4
ReactDOM.render((<App />), document.getElementById('demo-app'));
