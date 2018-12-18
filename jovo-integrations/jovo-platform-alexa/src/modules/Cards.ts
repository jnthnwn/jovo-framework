import {Plugin} from 'jovo-core';
import {Alexa} from "../Alexa";
import _get = require('lodash.get');
import _set = require('lodash.set');
import {AlexaSkill} from "../core/AlexaSkill";
import {SimpleCard} from "../response/visuals/SimpleCard";
import {StandardCard} from "../response/visuals/StandardCard";
import {LinkAccountCard} from "../response/visuals/LinkAccountCard";
import {AskForLocationPermissionsCard} from "../response/visuals/AskForLocationPermissionsCard";
import {AskForListPermissionsCard} from "../response/visuals/AskForListPermissionsCard";
import {AskForContactPermissionsCard} from "../response/visuals/AskForContactPermissionsCard";
import {Card} from "../response/visuals/Card";
import {AlexaResponse} from "..";


export class Cards implements Plugin {


    install(alexa: Alexa) {

        alexa.middleware('$output')!.use(this.output.bind(this));

        AlexaSkill.prototype.showStandardCard = function(title: string, text: string, image: {smallImageUrl: string, largeImageUrl: string}) {
            _set(this.$output, 'Alexa.StandardCard',
                new StandardCard()
                    .setTitle(title)
                    .setText(text)
                    .setSmallImageUrl(image.smallImageUrl)
                    .setLargeImageUrl(image.largeImageUrl)
            );
            return this;
        };
        AlexaSkill.prototype.showAskForCountryAndPostalCodeCard = function() {
            _set(this.$output, 'Alexa.AskForPermissionsConsentCard',
                new AskForLocationPermissionsCard()
                    .setAskForCountryAndPostalCodePermission()
            );
            return this;
        };

        AlexaSkill.prototype.showAskForCountryAndPostalCodeCard = function() {
            _set(this.$output, 'Alexa.AskForPermissionsConsentCard',
                new AskForLocationPermissionsCard()
                    .setAskForAddressPermission()
            );
            return this;
        };

        AlexaSkill.prototype.showAskForListPermissionCard = function(types: string[]) {
            _set(this.$output, 'Alexa.AskForPermissionsConsentCard',
                new AskForListPermissionsCard(types)
            );
            return this;
        };

        AlexaSkill.prototype.showAskForContactPermissionCard = function(contactProperties: string[]) {
            _set(this.$output, 'Alexa.AskForPermissionsConsentCard',
                new AskForContactPermissionsCard(contactProperties)
            );
            return this;
        };
        AlexaSkill.prototype.showCard = function(card: Card) {
            _set(this.$output, `Alexa.${card.constructor.name}`,
                card
            );
            return this;
        };

    }
    uninstall(alexa: Alexa) {
    }

    output(alexaSkill: AlexaSkill) {

        const output = alexaSkill.$output;
        if (!alexaSkill.$response) {
            alexaSkill.$response = new AlexaResponse();
        }
        const cardSimpleCard = _get(output, 'Alexa.card.SimpleCard') || _get(output, 'card.SimpleCard');
        if (cardSimpleCard) {
            _set(alexaSkill.$response, 'response.card',
                new SimpleCard()
                    .setTitle(_get(cardSimpleCard, 'title'))
                    .setContent(_get(cardSimpleCard, 'text'))
            );
        }
        const cardImageCard = _get(output, 'Alexa.card.ImageCard') || _get(output, 'card.ImageCard');
        if (cardImageCard) {
            _set(alexaSkill.$response, 'response.card',
                new StandardCard()
                    .setTitle(_get(cardImageCard, 'title'))
                    .setText(_get(cardImageCard, 'text'))
                    .setSmallImageUrl(_get(cardImageCard, 'imageUrl'))
                    .setLargeImageUrl(_get(cardImageCard, 'imageUrl'))
            );
        }

        if (_get(output, 'card.AccountLinkingCard')) {
            _set(alexaSkill.$response, 'response.card',
                new LinkAccountCard()
            );
        }


        // alexa specific
        if (_get(output, 'Alexa.SimpleCard')) {
            _set(alexaSkill.$response, 'response.card',
                _get(output, 'Alexa.SimpleCard')
            );
        }

        if (_get(output, 'Alexa.StandardCard')) {
            _set(alexaSkill.$response, 'response.card',
                _get(output, 'Alexa.StandardCard')
            );
        }

        if (_get(output, 'Alexa.LinkAccountCard')) {
            _set(alexaSkill.$response, 'response.card',
                new LinkAccountCard()
            );
        }


        if (_get(output, 'Alexa.AskForPermissionsConsentCard')) {
            _set(alexaSkill.$response, 'response.card',
                _get(output, 'Alexa.AskForPermissionsConsentCard')
            );
        }


    }

}