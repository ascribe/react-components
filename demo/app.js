/* eslint-disable no-alert, no-console */
/* eslint-disable import/no-extraneous-dependencies */

import 'bootstrap-loader';

import React from 'react';
import ReactDOM from 'react-dom';

import { arrayFrom } from 'js-utility-belt/es6';
import { createTextFile, computeFileHash } from 'js-utility-belt/es6/file';

import {
    FakeAutoCompleteInputs,
    createFormForPropertyTypes,
    InputCheckbox,
    InputDate,
    InputTextarea,
    InputUploader,
    Property,
    SimpleProperty as simplePropertyBuilder
} from '../modules/form';
import { Checkbox, Grouping, Spinner } from '../modules/ui';
import { UploadButton, UploadDragAndDropArea } from '../modules/uploader';

import './app.scss';


// Create Form and tracked Property types
const SimpleProperty = simplePropertyBuilder(Property);
const Form = createFormForPropertyTypes(Property, SimpleProperty);

// TODO: turn this into a nicely formatted styleguide
const App = () => {
    const dummyUploaderProps = {
        objectProperties: {
            bucket: 'dummy_bucket'
        },
        signature: {
            endpoint: 's3/signature/'
        }
    };

    return (
        <div>
            <marquee direction="right">
                Well, this could certainly be made better, ideally we'd have an auto-generated
                styleguide or something... but for now you can enjoy this
            </marquee>
            <h2>Groupings</h2>
            <h3>Button Grouping</h3>
            <div>
                <Grouping>
                    <button>Button 1</button>
                    <button>Button 2</button>
                    <button>Button 3</button>
                </Grouping>
            </div>
            <h4>Pulled right</h4>
            <div>
                <div className="clearfix">
                    <Grouping className="pull-right">
                        <button>Button 1</button>
                        <button>Button 2</button>
                        <button>Button 3</button>
                    </Grouping>
                </div>
            </div>
            <h4>Vertical</h4>
            <div>
                <Grouping vertical>
                    <button>Button 1</button>
                    <button>Button 2</button>
                    <button>Button 3</button>
                </Grouping>
            </div>
            <h4>Vertical pulled right</h4>
            <div>
                <div className="clearfix">
                    <Grouping vertical className="pull-right">
                        <button>Button 1</button>
                        <button>Button 2</button>
                        <button>Button 3</button>
                    </Grouping>
                </div>
            </div>
            <h2>Forms</h2>
            <h3>Basic Form</h3>
            <div>
                <Form
                    onSubmit={(data) => {
                        console.log(data);
                        return Promise.resolve();
                    }}>
                    <div>Should be ignored in refs</div>
                    <Property
                        label="Basic property"
                        name="basic">
                        <input placeholder="basic placeholder" type="text" />
                    </Property>
                    <Property
                        defaultValue="default"
                        label="Default value label"
                        name="default">
                        <input placeholder="default value placeholder" type="text" />
                    </Property>
                    <Property
                        label="Required property label"
                        name="required">
                        <input required placeholder="required property placeholder" type="text" />
                    </Property>
                    <Property
                        footer="footer"
                        label="Footer property label"
                        name="footer">
                        <input placeholder="footer property placeholder" type="text" />
                    </Property>
                    <Property
                        defaultChecked
                        label="Plain checkbox label"
                        name="checkbox">
                        <input type="checkbox" />
                    </Property>
                    <Property
                        defaultChecked
                        label="Custom checkbox label"
                        name="customCheckbox">
                        <InputCheckbox label="checkbox" />
                    </Property>
                    <Property
                        label="Select property label"
                        name="select">
                        <select>
                            <option value="value1">Value 1</option>
                            <option value="value2">Value 2</option>
                            <option value="value3">Value 3</option>
                        </select>
                    </Property>
                    <Property
                        highlighted
                        defaultValue="higlighted"
                        label="Highlighted label"
                        name="highlighted">
                        <input placeholder="highlighted placeholder" type="text" />
                    </Property>
                    <Property
                        ignoreFocus
                        defaultValue="ignore focus"
                        label="Ignore focus label"
                        name="ignorefocus">
                        <input placeholder="ignore focus placeholder" type="text" />
                    </Property>
                    <Property
                        disabled
                        defaultValue="disabled"
                        label="Disabled property label"
                        name="disabled">
                        <input placeholder="disabled property placeholder" type="text" />
                    </Property>
                    <Property
                        hidden
                        defaultValue="hidden"
                        label="Hidden property label"
                        name="hidden">
                        <input placeholder="hidden property placeholder" type="text" />
                    </Property>
                </Form>
            </div>
            <h3>Autocomplete form</h3>
            <div>
                <Form
                    autoComplete="on"
                    onSubmit={(data) => {
                        console.log(data);
                        return Promise.resolve();
                    }}>
                    <Property
                        label="Autocomplete username label"
                        name="username">
                        <input placeholder="autocomplete username placeholder" type="text" />
                    </Property>
                    <Property
                        label="Autocomplete password label"
                        name="password">
                        <input placeholder="autocomplete password placeholder" type="text" />
                    </Property>
                </Form>
            </div>
            <h3>Custom buttons form</h3>
            <div>
                <Form
                    buttonDefault={<button>Custom default button</button>}
                    buttonEdited={<button>Custom edited button</button>}
                    buttonSubmitting={<button>Custom submitting button</button>}
                    onSubmit={(data) => {
                        console.log(data);
                        console.log('Wait 10s for submission to end...');
                        return new Promise((resolve) => {
                            setTimeout(resolve, 10000);
                        });
                    }}>
                    <Property
                        label="Custom buttons label"
                        name="custom buttons">
                        <input placeholder="custom buttons placeholder" type="text" />
                    </Property>
                </Form>
            </div>
            <h3>Custom fake autocomplete form</h3>
            <div>
                <Form
                    fakeAutoCompleteInputs={
                        (<FakeAutoCompleteInputs fields={[{ name: 'name', type: 'password' }]} />)
                    }
                    onSubmit={(data) => {
                        console.log(data);
                        return Promise.resolve();
                    }}>
                    <Property
                        label="Fake autocomplete label"
                        name="fake autocomplete">
                        <input placeholder="fake autocomplete placeholder" type="text" />
                    </Property>
                </Form>
            </div>
            <h3>Simple Properties</h3>
            <div>
                <Form
                    onSubmit={(data) => {
                        console.log(data);
                        return Promise.resolve();
                    }}>
                    <SimpleProperty
                        label="Simple property"
                        name="simple">
                        <input placeholder="simple placeholder" type="text" />
                    </SimpleProperty>
                    <SimpleProperty
                        defaultValue="default"
                        label="Default simple property value label"
                        name="default">
                        <input placeholder="default simple property value placeholder" type="text" />
                    </SimpleProperty>
                    <SimpleProperty
                        label="Required simple property label"
                        name="required">
                        <input required placeholder="required simple property placeholder" type="text" />
                    </SimpleProperty>
                    <SimpleProperty
                        footer="footer"
                        label="Footer simple property label"
                        name="footer">
                        <input placeholder="footer simple property placeholder" type="text" />
                    </SimpleProperty>
                    <SimpleProperty
                        defaultChecked
                        label="Plain checkbox simple property label"
                        name="checkbox">
                        <input type="checkbox" />
                    </SimpleProperty>
                    <SimpleProperty
                        defaultChecked
                        label="Custom checkbox simple property label"
                        name="customCheckbox">
                        <InputCheckbox label="checkbox" />
                    </SimpleProperty>
                    <SimpleProperty
                        label="Select simple property label"
                        name="select">
                        <select>
                            <option value="value1">Value 1</option>
                            <option value="value2">Value 2</option>
                            <option value="value3">Value 3</option>
                        </select>
                    </SimpleProperty>
                </Form>
            </div>
            <h3>Custom Inputs</h3>
            <div>
                <Form
                    onSubmit={(data) => {
                        console.log(data);
                        return Promise.resolve();
                    }}>
                    <Property
                        label="checkbox label"
                        name="checkbox">
                        <InputCheckbox label="checkbox" />
                    </Property>
                    <Property
                        defaultChecked
                        label="default checkbox label"
                        name="defaultCheckbox">
                        <InputCheckbox label="defaultCheckbox" />
                    </Property>
                    <Property
                        label="required checkbox label"
                        name="requiredCheckbox">
                        <InputCheckbox required label="required checkbox" />
                    </Property>
                    <Property
                        label="date label"
                        name="date">
                        <InputDate />
                    </Property>
                    <Property
                        defaultValue="2010-01-01"
                        label="default date label"
                        name="default Date">
                        <InputDate />
                    </Property>
                    <Property
                        label="textarea label"
                        name="textarea">
                        <InputTextarea placeholder="textarea" rows={2} />
                    </Property>
                    <Property
                        defaultValue="default"
                        label="default textarea label"
                        name="defaulttextarea">
                        <InputTextarea rows={1} />
                    </Property>
                    <Property
                        disabled
                        checkboxLabel="disabled textarea"
                        defaultValue="disabled"
                        label="disabled textarea label"
                        name="disabledtextarea">
                        <InputTextarea rows={2} />
                    </Property>
                </Form>
            </div>
            <h2>UI Elements</h2>
            <h3>Checkbox</h3>
            <div>
                <Checkbox label="checkbox" />
            </div>
            <h3>Disabled checkbox</h3>
            <div>
                <Checkbox disabled label="disabled checkbox" />
            </div>
            <h3>Spinners</h3>
            <div>
                <Spinner size={50} />
                <Spinner color="pink" size={50} />
                <Spinner loop size={50} />
                <Spinner size={100} />
            </div>
            <div>
                <Spinner loop size={50}>
                    <span
                        style={{
                            fontSize: '20px',
                            left: '18px',
                            position: 'absolute',
                            top: '10.5px'
                        }}>
                        A
                    </span>
                </Spinner>
            </div>
            <div style={{ position: 'relative' }}>
                <Spinner loop size={50} />
                <span
                    style={{
                        fontSize: '20px',
                        left: '18px',
                        position: 'absolute',
                        top: '10.5px'
                    }}>
                    A
                </span>
            </div>
            <h2>Uploader</h2>
            <h3>Upload button</h3>
            <div>
                <UploadButton
                    getUploadingButtonLabel={(_, progress) => `Upload progress: ${progress}%`}
                    uploaderProps={dummyUploaderProps} />
            </div>
            <h3>Upload button with children</h3>
            <div>
                <UploadButton
                    uploaderProps={dummyUploaderProps}>
                    Upload button with children
                </UploadButton>
            </div>
            <h4>Custom upload button</h4>
            <div>
                <UploadButton
                    buttonType={(props) => (
                        <button {...props} style={{ backgroundColor: 'lightblue' }}>
                            Custom upload button
                        </button>
                    )}
                    getUploadingButtonLabel={(_, progress) => `Upload progress: ${progress}%`}
                    uploaderProps={dummyUploaderProps} />
            </div>
            <h4>Hashing upload button</h4>
            <div>
                <UploadButton
                    getUploadingButtonLabel={(_, progress) => `Upload progress: ${progress}%`}
                    uploaderProps={{
                        ...dummyUploaderProps,
                        onSubmitFiles: (files) => {
                            const fileToHash = files[0];

                            return computeFileHash(fileToHash)
                                .then((hash) => {
                                    const hashedFile = createTextFile(
                                        hash,
                                        `hash-of-${fileToHash.name}`,
                                        fileToHash
                                    );

                                    console.log(`Hash: ${hash}`);
                                    console.log('Hashed file: ', hashedFile);

                                    return [hashedFile];
                                });
                        }
                    }} />
            </div>
            <h4>Disabled upload button</h4>
            <div>
                <UploadButton
                    disabled
                    getUploadingButtonLabel={(_, progress) => `Upload progress: ${progress}%`}
                    uploaderProps={dummyUploaderProps} />
            </div>
            <h4>No label upload button</h4>
            <div>
                <UploadButton
                    getUploadingButtonLabel={(_, progress) => `Upload progress: ${progress}%`}
                    showFileLabel={false}
                    uploaderProps={dummyUploaderProps} />
            </div>
            <h3>Drag and drop</h3>
            <h3>Drag and drop</h3>
            <div>
                <UploadDragAndDropArea uploaderProps={dummyUploaderProps}>
                    <div style={{ 'width': 100, 'height': 100, 'backgroundColor': 'green' }} />
                </UploadDragAndDropArea>
            </div>
            <h3>Drag and drop ignore files</h3>
            <div>
                <UploadDragAndDropArea
                    onDrop={(event) => {
                        if (event && event.dataTransfer && event.dataTransfer.files.length > 0) {
                            const droppedFiles = arrayFrom(event.dataTransfer.files)
                                .reduce((names, file) => `${names} ${file.name}`, '');

                            alert(`Ignoring dropped files: ${droppedFiles}`);
                        }
                    }}
                    uploaderProps={dummyUploaderProps}>
                    <div style={{ 'width': 100, 'height': 100, 'backgroundColor': 'red' }} />
                </UploadDragAndDropArea>
            </div>
            <h3>Form Uploader</h3>
            <div>
                <Form
                    header="Uploader Form"
                    onSubmit={(data) => {
                        console.log(data);
                        return Promise.resolve();
                    }}>
                    <Property
                        label="input uploader"
                        name="inputuploader">
                        <InputUploader
                            filesValidation={(files) => files.length > 1}
                            onFilesValidationChange={(prevResult, nextResult) => (
                                alert(`file validation toggled with prev: ${prevResult} ` +
                                      `and next: ${nextResult}`)
                            )}>
                            <UploadButton className="upload-input" uploaderProps={dummyUploaderProps} />
                        </InputUploader>
                    </Property>
                </Form>
            </div>
        </div>
    );
};

ReactDOM.render((<App />), document.getElementById('demo-app'));
