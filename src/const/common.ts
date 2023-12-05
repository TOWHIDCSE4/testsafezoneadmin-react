export const PAGINATION_CONFIG = {
    bordered: true,
    scroll: {
        x: 500,
        y: 768
    },
    sticky: true
}

export const TEACHER_ALLOWED_ABSENCE_CLASS = 4

export interface IModalProps {
    visible: boolean
    toggleModal: (visible: boolean) => void
}

export const encodeFilenameFromLink = (link) => {
    if (!link) {
        return null
    }

    const fileName = encodeURIComponent(`${link}`.split('/').pop())
    const path = link.substring(0, link.lastIndexOf('/') + 1)
    return path + fileName
}

export enum EnumTypeAccount {
    Family = 1,
    School = 2
}

export enum EnumTypePlan {
    Family = 1,
    School = 2
}
